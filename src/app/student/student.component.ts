import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ProfileService } from '../core/services/profile.service';
import { DocumentService } from '../core/services/document.service';
import { ProgressService } from '../core/services/progress.service';
import {
  StudentProfileResponse,
  StudentDocument,
  Progress,
  ProgressStage,
  ProgressStatus
} from '../shared/models/models';

type ActiveSection = 'profile' | 'documents' | 'progress';
type DocumentTab = 'cv' | 'passport' | 'idcard';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './student.component.html',
  styleUrl: './student.component.css'
})
export class StudentProfileComponent implements OnInit {

  // ── Navigation ──
  activeSection: ActiveSection = 'profile';

  // ── User ──
  userId = 0;
  userRole = '';

  // ── Profile ──
  profile: StudentProfileResponse | null = null;
  isLoadingProfile = true;

  // ── Documents ──
  documents: StudentDocument[] = [];
  isLoadingDocs = false;
  activeDocTab: DocumentTab = 'cv';
  isUploading = false;
  uploadSuccess = '';
  uploadError = '';

  // CV Form
  cvFile: File | null = null;
  cvForm = { summary: '', experience: '', skills: '' };

  // Passport Form
  passportFile: File | null = null;
  passportForm = { issueDate: '', expiryDate: '', issuingCountry: '' };

  // ID Card Form
  idCardFile: File | null = null;
  idCardForm = { numId: '', birthday: '' };

  // ── Progress ──
  progressList: Progress[] = [];
  isLoadingProgress = false;

  allStages: ProgressStage[] = [
    'ORIENTATION',
    'DOSSIER_PREPARATION',
    'INTERVIEW',
    'DOCUMENT_VERIFICATION',
    'ADMISSION_CONFIRMATION'
  ];

  stageLabels: Record<ProgressStage, string> = {
    ORIENTATION: 'Orientation',
    DOSSIER_PREPARATION: 'Dossier Preparation',
    INTERVIEW: 'Interview',
    DOCUMENT_VERIFICATION: 'Document Verification',
    ADMISSION_CONFIRMATION: 'Admission Confirmation'
  };

  stageIcons: Record<ProgressStage, string> = {
    ORIENTATION: '🎯',
    DOSSIER_PREPARATION: '📁',
    INTERVIEW: '🎤',
    DOCUMENT_VERIFICATION: '✅',
    ADMISSION_CONFIRMATION: '🎓'
  };

  constructor(
    private readonly authService: AuthService,
    private readonly profileService: ProfileService,
    private readonly documentService: DocumentService,
    private readonly progressService: ProgressService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const id = this.authService.getUserId();
    this.userId = id ? Number(id) : 0;
    this.userRole = this.authService.getUserRole() || '';
    console.log('Student userId:', this.userId); // debug
    this.loadProfile();
  }

  // ── Navigation ──
  setSection(section: ActiveSection): void {
    this.activeSection = section;
    // Always reload when switching to documents or progress
    if (section === 'documents') this.loadDocuments();
    if (section === 'progress') this.loadProgress();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  // ── Profile ──
  loadProfile(): void {
    this.isLoadingProfile = true;
    this.profileService.getMyProfile().subscribe({
      next: (data) => { this.profile = data; this.isLoadingProfile = false; },
      error: () => { this.isLoadingProfile = false; }
    });
  }

  getInitials(): string {
    const f = this.profile?.user?.firstName?.charAt(0) || '';
    const l = this.profile?.user?.lastName?.charAt(0) || '';
    return (f + l).toUpperCase() || '??';
  }

  getAvatarUrl(): string {
    if (!this.profile?.avatar) return '';
    if (this.profile.avatar.startsWith('http')) return this.profile.avatar;
    return 'http://localhost:8080' + this.profile.avatar;
  }

  // ── Documents ──
  loadDocuments(): void {
    this.isLoadingDocs = true;
    this.documentService.getStudentDocuments(this.userId).subscribe({
      next: (data) => { this.documents = data; this.isLoadingDocs = false; },
      error: () => { this.isLoadingDocs = false; }
    });
  }

  getDocumentByType(type: string): StudentDocument | undefined {
    return this.documents.find(d => d.documentType === type);
  }

  onFileSelected(event: Event, type: DocumentTab): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (type === 'cv') this.cvFile = file;
    if (type === 'passport') this.passportFile = file;
    if (type === 'idcard') this.idCardFile = file;
  }

  uploadCv(): void {
    if (!this.cvFile) { this.uploadError = 'Please select a file.'; return; }
    this.isUploading = true;
    this.uploadError = '';
    this.uploadSuccess = '';
    this.documentService.uploadCv(
      this.userId, this.cvFile,
      this.cvForm.summary, this.cvForm.experience, this.cvForm.skills
    ).subscribe({
      next: () => {
        this.uploadSuccess = 'CV uploaded successfully!';
        this.isUploading = false;
        this.cvFile = null;
        this.cvForm = { summary: '', experience: '', skills: '' };
        this.loadDocuments();
      },
      error: (err: { error?: { message?: string } }) => {
        this.uploadError = err?.error?.message || 'Upload failed.';
        this.isUploading = false;
      }
    });
  }

  uploadPassport(): void {
    if (!this.passportFile) { this.uploadError = 'Please select a file.'; return; }
    this.isUploading = true;
    this.uploadError = '';
    this.uploadSuccess = '';
    this.documentService.uploadPassport(
      this.userId, this.passportFile,
      this.passportForm.issueDate, this.passportForm.expiryDate, this.passportForm.issuingCountry
    ).subscribe({
      next: () => {
        this.uploadSuccess = 'Passport uploaded successfully!';
        this.isUploading = false;
        this.passportFile = null;
        this.passportForm = { issueDate: '', expiryDate: '', issuingCountry: '' };
        this.loadDocuments();
      },
      error: (err: { error?: { message?: string } }) => {
        this.uploadError = err?.error?.message || 'Upload failed.';
        this.isUploading = false;
      }
    });
  }

  uploadIdCard(): void {
    if (!this.idCardFile) { this.uploadError = 'Please select a file.'; return; }
    this.isUploading = true;
    this.uploadError = '';
    this.uploadSuccess = '';
    this.documentService.uploadIdCard(
      this.userId, this.idCardFile,
      this.idCardForm.numId, this.idCardForm.birthday
    ).subscribe({
      next: () => {
        this.uploadSuccess = 'ID Card uploaded successfully!';
        this.isUploading = false;
        this.idCardFile = null;
        this.idCardForm = { numId: '', birthday: '' };
        this.loadDocuments();
      },
      error: (err: { error?: { message?: string } }) => {
        this.uploadError = err?.error?.message || 'Upload failed.';
        this.isUploading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    if (status === 'APPROVED') return 'status-approved';
    if (status === 'REJECTED') return 'status-rejected';
    return 'status-pending';
  }

  getStatusLabel(status: string): string {
    if (status === 'APPROVED') return '✅ Approved';
    if (status === 'REJECTED') return '❌ Rejected';
    return '⏳ Pending';
  }

  // ── Progress ──
  loadProgress(): void {
    this.isLoadingProgress = true;
    this.progressService.getStudentProgress(this.userId).subscribe({
      next: (data) => { this.progressList = data; this.isLoadingProgress = false; },
      error: () => { this.isLoadingProgress = false; }
    });
  }

  getStageStatus(stage: ProgressStage): ProgressStatus {
    const found = this.progressList.find(p => p.stage === stage);
    return found?.status || 'NOT_STARTED';
  }

  getStageClass(stage: ProgressStage): string {
    const status = this.getStageStatus(stage);
    if (status === 'COMPLETED') return 'stage-completed';
    if (status === 'IN_PROGRESS') return 'stage-inprogress';
    return 'stage-notstarted';
  }

  getCompletedCount(): number {
    return this.allStages.filter(s => this.getStageStatus(s) === 'COMPLETED').length;
  }

  parseLanguages(json: string): { name: string; level: string; rank: number }[] {
    try { return JSON.parse(json); } catch { return []; }
  }
  
}