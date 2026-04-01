import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { AgentService } from '../core/services/agent.service';
import { ChatService } from '../core/services/chat.service';
import {
  AssignedStudent,
  DocumentResponseDTO,
  Progress,
  ProgressStage,
  AgentProfileResponse
} from '../shared/models/models';

type AgentView = 'students' | 'student-detail';
type DetailTab = 'profile' | 'documents' | 'progress';

@Component({
  selector: 'app-agent',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './agent.component.html',
  styleUrl: './agent.component.css'
})
export class AgentComponent implements OnInit {

  // ── Auth ──
  agentId = 0;
  agentName = '';
  unreadMessagesCount = 0;

  // ── Agent's own profile ──
  agentProfile: AgentProfileResponse | null = null;
  isLoadingAgentProfile = true;

  // ── Navigation ──
  currentView: AgentView = 'students';
  activeTab: DetailTab = 'profile';

  // ── Students List ──
  students: AssignedStudent[] = [];
  isLoadingStudents = true;
  studentsError = '';

  // ── Selected Student ──
  selectedStudent: AssignedStudent | null = null;
  studentProfile: any = null;
  isLoadingProfile = false;

  // ── Documents ──
  documents: DocumentResponseDTO[] = [];
  isLoadingDocs = false;
  isVerifying = false;
  verifySuccess = '';
  verifyError = '';

  // ── Progress ──
  progressList: Progress[] = [];
  isLoadingProgress = false;
  isUpdatingProgress = false;
  progressSuccess = '';
  progressError = '';

  // Updated allStages with comprehensive stages
  allStages: ProgressStage[] = [
    'ORIENTATION',
    'DOSSIER_PREPARATION',
    'DOCUMENT_COLLECTION',
    'LANGUAGE_TESTS',
    'UNIVERSITY_SELECTION',
    'APPLICATION_SUBMISSION',
    'INTERVIEW_PREPARATION',
    'ACCEPTANCE_LETTER',
    'VISA_APPLICATION',
    'ACCOMMODATION',
    'TRAVEL_PLANNING',
    'PRE_DEPARTURE',
    'ARRIVAL_SETTLEMENT'
  ];

  // Updated stageLabels with all stages
  stageLabels: Record<ProgressStage, string> = {
    ORIENTATION: 'Orientation & Planning',
    DOSSIER_PREPARATION: 'Dossier Preparation',
    DOCUMENT_COLLECTION: 'Document Collection',
    LANGUAGE_TESTS: 'Language Tests (IELTS/TOEFL)',
    UNIVERSITY_SELECTION: 'University Selection',
    APPLICATION_SUBMISSION: 'Application Submission',
    INTERVIEW_PREPARATION: 'Interview Preparation',
    ACCEPTANCE_LETTER: 'Acceptance Letter',
    VISA_APPLICATION: 'Visa Application',
    ACCOMMODATION: 'Accommodation Arrangement',
    TRAVEL_PLANNING: 'Travel Planning',
    PRE_DEPARTURE: 'Pre-Departure Preparation',
    ARRIVAL_SETTLEMENT: 'Arrival & Settlement'
  };

  // Updated stageIcons with FontAwesome classes
  stageIcons: Record<ProgressStage, string> = {
    ORIENTATION: 'fa-solid fa-compass',
    DOSSIER_PREPARATION: 'fa-solid fa-folder-open',
    DOCUMENT_COLLECTION: 'fa-solid fa-file-alt',
    LANGUAGE_TESTS: 'fa-solid fa-language',
    UNIVERSITY_SELECTION: 'fa-solid fa-university',
    APPLICATION_SUBMISSION: 'fa-solid fa-paper-plane',
    INTERVIEW_PREPARATION: 'fa-solid fa-chalkboard-user',
    ACCEPTANCE_LETTER: 'fa-solid fa-envelope-open-text',
    VISA_APPLICATION: 'fa-solid fa-passport',
    ACCOMMODATION: 'fa-solid fa-building',
    TRAVEL_PLANNING: 'fa-solid fa-plane',
    PRE_DEPARTURE: 'fa-solid fa-suitcase',
    ARRIVAL_SETTLEMENT: 'fa-solid fa-home'
  };

  constructor(
    private readonly authService: AuthService,
    private readonly agentService: AgentService,
    private readonly chatService: ChatService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.agentId = Number(this.authService.getUserId());
    this.loadAgentProfile();
    this.loadStudents();
    this.loadUnreadMessagesCount();
    
    // Refresh unread count every 30 seconds
    setInterval(() => {
      this.loadUnreadMessagesCount();
    }, 30000);
  }

  // ── Unread Messages ──
  loadUnreadMessagesCount(): void {
    if (!this.agentId) return;
    
    this.chatService.getUnreadMessages(this.agentId).subscribe({
      next: (messages) => {
        this.unreadMessagesCount = messages.length;
      },
      error: () => {
        this.unreadMessagesCount = 0;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  // ── Agent's own profile ──
  loadAgentProfile(): void {
    this.isLoadingAgentProfile = true;
    this.agentService.getMyAgentProfile().subscribe({
      next: (data) => {
        this.agentProfile = data;
        this.isLoadingAgentProfile = false;
      },
      error: () => {
        this.isLoadingAgentProfile = false;
      }
    });
  }

  getAgentAvatarUrl(): string {
    if (!this.agentProfile?.avatar) return '';
    if (this.agentProfile.avatar.startsWith('http')) return this.agentProfile.avatar;
    return 'http://localhost:8080' + this.agentProfile.avatar;
  }

  getAgentInitials(): string {
    const f = this.agentProfile?.user?.firstName?.charAt(0) || '';
    const l = this.agentProfile?.user?.lastName?.charAt(0) || '';
    return (f + l).toUpperCase() || '??';
  }

  getAgentStatusClass(): string {
    switch (this.agentProfile?.onlineStatus) {
      case 'ONLINE':  return 'status-online';
      case 'AWAY':    return 'status-away';
      case 'OFFLINE': return 'status-offline';
      default:        return 'status-offline';
    }
  }

  // ── Students ──
  loadStudents(): void {
    this.isLoadingStudents = true;
    this.agentService.getMyStudents(this.agentId).subscribe({
      next: (data) => {
        this.students = data;
        this.isLoadingStudents = false;
      },
      error: () => {
        this.studentsError = 'Failed to load students.';
        this.isLoadingStudents = false;
      }
    });
  }

  selectStudent(student: AssignedStudent): void {
    this.selectedStudent = student;
    this.currentView = 'student-detail';
    this.activeTab = 'profile';
    this.studentProfile = null;
    this.documents = [];
    this.progressList = [];
    this.verifySuccess = '';
    this.verifyError = '';
    this.progressSuccess = '';
    this.progressError = '';
    this.loadStudentProfile(student.id);
  }

  backToStudents(): void {
    this.currentView = 'students';
    this.selectedStudent = null;
  }

  setTab(tab: DetailTab): void {
    this.activeTab = tab;
    if (tab === 'documents' && this.documents.length === 0) this.loadDocuments();
    if (tab === 'progress'  && this.progressList.length === 0) this.loadProgress();
  }

  // ── Student Profile ──
  loadStudentProfile(studentId: number): void {
    this.isLoadingProfile = true;
    this.agentService.getStudentProfile(studentId).subscribe({
      next: (data) => {
        this.studentProfile = data;
        this.isLoadingProfile = false;
      },
      error: () => { this.isLoadingProfile = false; }
    });
  }

  getInitials(student: AssignedStudent): string {
    return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
  }

  getStudentAvatarUrl(): string {
    if (!this.studentProfile?.avatar) return '';
    if (this.studentProfile.avatar.startsWith('http')) return this.studentProfile.avatar;
    return 'http://localhost:8080' + this.studentProfile.avatar;
  }

  getStudentStatusClass(): string {
    switch (this.studentProfile?.onlineStatus) {
      case 'ONLINE':  return 'status-online';
      case 'AWAY':    return 'status-away';
      case 'OFFLINE': return 'status-offline';
      default:        return 'status-offline';
    }
  }

  parseLanguages(json: string): { name: string; level: string; rank: number }[] {
    try { return JSON.parse(json); } catch { return []; }
  }

  // ── Documents ──
  loadDocuments(): void {
    if (!this.selectedStudent) return;
    this.isLoadingDocs = true;
    this.agentService.getStudentDocuments(this.selectedStudent.id).subscribe({
      next: (data) => { this.documents = data; this.isLoadingDocs = false; },
      error: () => { this.isLoadingDocs = false; }
    });
  }

  getDocumentByType(type: string): DocumentResponseDTO | undefined {
    return this.documents.find(d => d.documentType === type);
  }

  getDocumentDownloadUrl(filePath: string): string {
    const fileName = filePath.replace(/\\/g, '/').split('/').pop();
    return `http://localhost:8080/documents/${fileName}`;
  }

  verifyDocument(documentId: number, status: 'APPROVED' | 'REJECTED'): void {
    this.isVerifying = true;
    this.verifySuccess = '';
    this.verifyError = '';
    this.agentService.verifyDocument(documentId, this.agentId, status).subscribe({
      next: () => {
        this.verifySuccess = `Document ${status.toLowerCase()} successfully!`;
        this.isVerifying = false;
        this.loadDocuments();
      },
      error: (err: { error?: { error?: string } }) => {
        this.verifyError = err?.error?.error || 'Failed to update document status.';
        this.isVerifying = false;
      }
    });
  }

  getStatusClass(status: string): string {
    if (status === 'APPROVED') return 'status-approved';
    if (status === 'REJECTED') return 'status-rejected';
    return 'status-pending';
  }

  getStatusLabel(status: string): string {
    if (status === 'APPROVED') return 'Approved';
    if (status === 'REJECTED') return 'Rejected';
    return 'Pending';
  }

  // ── Progress Helper Methods ──
  getStageIcon(stage: ProgressStage): string {
    return this.stageIcons[stage] || 'fa-solid fa-circle-info';
  }

  getStageLabel(stage: ProgressStage): string {
    return this.stageLabels[stage] || stage;
  }

  // ── Progress ──
  loadProgress(): void {
    if (!this.selectedStudent) return;
    this.isLoadingProgress = true;
    this.agentService.getStudentProgress(this.selectedStudent.id).subscribe({
      next: (data) => { 
        this.progressList = data; 
        this.isLoadingProgress = false;
      },
      error: () => { 
        this.isLoadingProgress = false;
      }
    });
  }

  getStageProgress(stage: ProgressStage): Progress | undefined {
    return this.progressList.find(p => p.stage === stage);
  }

  getStageStatus(stage: ProgressStage): string {
    return this.getStageProgress(stage)?.status || 'NOT_STARTED';
  }

  getStageClass(stage: ProgressStage): string {
    const status = this.getStageStatus(stage);
    if (status === 'COMPLETED')  return 'stage-completed';
    if (status === 'IN_PROGRESS') return 'stage-inprogress';
    return 'stage-notstarted';
  }

  getCompletedCount(): number {
    return this.allStages.filter(s => this.getStageStatus(s) === 'COMPLETED').length;
  }

  updateStageStatus(stage: ProgressStage, newStatus: string): void {
    if (!this.selectedStudent) return;
    this.isUpdatingProgress = true;
    this.progressSuccess = '';
    this.progressError = '';

    const existing = this.getStageProgress(stage);

    if (existing) {
      this.agentService.updateProgressStatus(existing.id, newStatus).subscribe({
        next: () => {
          this.progressSuccess = `${this.getStageLabel(stage)} updated to ${newStatus.replace('_', ' ')}!`;
          this.isUpdatingProgress = false;
          this.loadProgress();
          setTimeout(() => this.progressSuccess = '', 3000);
        },
        error: () => {
          this.progressError = 'Failed to update progress.';
          this.isUpdatingProgress = false;
        }
      });
    } else {
      this.agentService.createProgress(this.selectedStudent.id, stage).subscribe({
        next: (created) => {
          this.agentService.updateProgressStatus(created.id, newStatus).subscribe({
            next: () => {
              this.progressSuccess = `${this.getStageLabel(stage)} set to ${newStatus.replace('_', ' ')}!`;
              this.isUpdatingProgress = false;
              this.loadProgress();
              setTimeout(() => this.progressSuccess = '', 3000);
            },
            error: () => {
              this.progressError = 'Failed to update progress.';
              this.isUpdatingProgress = false;
            }
          });
        },
        error: () => {
          this.progressError = 'Failed to create progress stage.';
          this.isUpdatingProgress = false;
        }
      });
    }
  }
}