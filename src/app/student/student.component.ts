import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ProfileService } from '../core/services/profile.service';
import { DocumentService } from '../core/services/document.service';
import { ProgressService } from '../core/services/progress.service';
import { ChatService } from '../core/services/chat.service';
import { QuizService } from '../core/services/quiz.service';
import { RecommendationService } from '../core/services/recommendation.service';
import {
  StudentProfileResponse,
  StudentDocument,
  Progress,
  ProgressStage,
  ProgressStatus,
  Quiz,
  QuizAnswerSubmission,
  QuizQuestion
} from '../shared/models/models';

type ActiveSection = 'profile' | 'documents' | 'progress' | 'quizzes' | 'recommendations';
type DocumentTab = 'cv' | 'passport' | 'idcard' | 'diploma' | 'transcript' | 'coverletter' | 'other';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './student.component.html',
  styleUrl: './student.component.css'
})
export class StudentProfileComponent implements OnInit, OnDestroy {

  // ── Navigation ──
  activeSection: ActiveSection = 'profile';

  // ── User ──
  userId = 0;
  userRole = '';
  unreadMessagesCount = 0;

  //Ticket
  pendingTicketsCount = 0;

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

  // Diploma Form
  diplomaFile: File | null = null;
  diplomaForm = { degree: '', institution: '', graduationYear: '', fieldOfStudy: '' };

  // Transcript Form
  transcriptFile: File | null = null;
  transcriptForm = { institution: '', academicYear: '', average: '' };

  // Cover Letter Form
  coverLetterFile: File | null = null;
  coverLetterForm = { targetUniversity: '', targetProgram: '', content: '' };

  // Other Document Form
  otherFile: File | null = null;
  otherForm = { documentTitle: '', notes: '' };

  // ── Progress ──
  
  progressList: Progress[] = [];
  isLoadingProgress = false;

  // ── Quizzes ──

  // ── Recommendations ──
  recommendations: any[] = [];
  isLoadingRecommendations = false;
  
  // Form object for the ML model inputs
  recommendationForm = {
    country: '',
    major: '',
    language: '',
    skills: '',
    moyenne: '' as string | number
  };

  recommendationMeta: any = null;
  assignedQuizzes: (Quiz & { startTime?: string; endTime?: string })[] = [];
  selectedQuiz: (Quiz & { startTime?: string; endTime?: string }) | null = null;
  selectedQuizQuestions: QuizQuestion[] = [];
  isLoadingQuizzes = false;
  quizError = '';
  currentQuestionIndex = 0;
  selectedAnswers: Record<number, string> = {};
  reviewMode = false;
  submittingQuiz = false;
  quizResult: { score: number; passed: boolean; message: string } | null = null;
  remainingTime = '';
  timeExpiredMessage = '';
  private quizTimer: any;

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

  // Updated stageIcons with FontAwesome classes (will be used in getStageIcon method)
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
    private readonly profileService: ProfileService,
    private readonly documentService: DocumentService,
    private readonly progressService: ProgressService,
    private readonly chatService: ChatService,
    private readonly quizService: QuizService,
    private readonly router: Router,
    private readonly recommendationService: RecommendationService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {}

  ngOnInit(): void {
    const id = this.authService.getUserId();
    this.userId = id ? Number(id) : 0;
    this.userRole = this.authService.getUserRole() || '';
    console.log('Student userId:', this.userId);
    this.loadProfile();
    this.loadUnreadMessagesCount();
    
    // Refresh unread count every 30 seconds only in the browser to avoid SSR hangs
    if (isPlatformBrowser(this.platformId)) {
      setInterval(() => {
        this.loadUnreadMessagesCount();
      }, 30000);
    }
  }

  // ── Unread Messages ──
  loadUnreadMessagesCount(): void {
    if (!this.userId) return;
    
    this.chatService.getUnreadMessages(this.userId).subscribe({
      next: (messages) => {
        this.unreadMessagesCount = messages.length;
      },
      error: () => {
        this.unreadMessagesCount = 0;
      }
    });
  }

  // ── Navigation ──
  setSection(section: ActiveSection): void {
    // If we're already in this section, don't re-trigger initial loads
    if (this.activeSection === section && section !== 'recommendations') return;
    
    this.activeSection = section;

    if (section === 'documents') this.loadDocuments();
    if (section === 'progress') this.loadProgress();
    if (section === 'quizzes') this.loadAssignedQuizzes();
    if (section === 'recommendations' && this.recommendations.length === 0) {
      this.initRecommendationForm();
      this.loadRecommendations();
    }
  }

  initRecommendationForm(): void {
    // Set sensible default values first, ensuring they are never empty
    this.recommendationForm = {
      country: 'Any', // Default country
      major: 'Any Field', // Default major
      language: 'English', // Default language
      skills: 'Problem Solving, Communication, Teamwork', // Default skills
      moyenne: 15 // Default average grade (e.g., out of 20), ensuring it's a number
    };

    // If profile exists, override with actual profile data
    if (this.profile) {
      // Ensure profile properties are not null/undefined before assigning
      // Use logical OR (||) to fall back to default if profile property is empty or null
      // For languages, parse and join, or use default
      const langs = this.parseLanguages(this.profile.languages || '[]');
      const languageNames = langs.map(l => l.name).join(', ');

      this.recommendationForm.country = this.profile.address || this.recommendationForm.country;
      this.recommendationForm.major = this.profile.speciality || this.recommendationForm.major;
      this.recommendationForm.language = languageNames || this.recommendationForm.language;
      // Assuming skills and moyenne are not directly in profile yet, keep defaults
      // If they were, you would update them here:
      // this.recommendationForm.skills = this.profile.skills || this.recommendationForm.skills;
      // this.recommendationForm.moyenne = this.profile.moyenne || this.recommendationForm.moyenne;
    }
    console.log('Recommendation form initialized:', this.recommendationForm);
  }

  loadRecommendations(): void {
    // Prevent multiple concurrent requests
    if (this.isLoadingRecommendations) return;
    
    console.log('Sending recommendation request to ML backend...', this.recommendationForm);
    
    this.isLoadingRecommendations = true;

    this.recommendationService.getRecommendations(this.recommendationForm).subscribe({
      next: (data: any) => {
        console.log('ML Response Data:', data); // IMPORTANT: Check this in your browser console!
        this.recommendations = data.recommendations;
        this.recommendationMeta = data.meta;
        this.isLoadingRecommendations = false;
      },
      error: () => { this.isLoadingRecommendations = false; }
    });
  }

  loadAssignedQuizzes(): void {
    this.isLoadingQuizzes = true;
    this.quizError = '';
    this.quizService.getAssignedQuizzes(this.userId).subscribe({
      next: (quizzes) => {
        this.assignedQuizzes = quizzes as any;
        this.isLoadingQuizzes = false;
      },
      error: () => {
        this.isLoadingQuizzes = false;
        this.quizError = 'Failed to load assigned quizzes.';
      }
    });
  }

  openQuiz(quiz: (Quiz & { startTime?: string; endTime?: string })): void {
    console.log('Opening Quiz Data:', quiz); // Debug to check property names (e.g., startTime vs start_time)
    this.selectedQuiz = quiz;
    this.currentQuestionIndex = 0;
    this.selectedAnswers = {};
    this.reviewMode = false;
    this.quizResult = null;
    this.timeExpiredMessage = '';
    this.startQuizTimer(quiz);
    this.quizService.getQuizQuestionsForStudent(quiz.id, this.userId).subscribe({
      next: (questions) => {
        this.selectedQuizQuestions = questions;
      },
      error: () => {
        this.selectedQuizQuestions = [];
        this.quizError = 'Could not load quiz questions.';
      }
    });
  }

  startQuizTimer(quiz: any): void {
    if (this.quizTimer) clearInterval(this.quizTimer);
    if (!this.hasValidTiming(quiz)) {
      this.remainingTime = '';
      this.timeExpiredMessage = '';
      return;
    }
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const start = this.getQuizStartTime(quiz).getTime();
      const end = this.getQuizEndTime(quiz).getTime();

      if (now < start) {
        this.remainingTime = 'Starting Soon';
      } else if (now >= end) {
        this.remainingTime = 'EXPIRED';
        clearInterval(this.quizTimer);
        if (!this.quizResult && !this.submittingQuiz) {
          const endedAt = this.getQuizEndTime(quiz);
          const endedAtText = endedAt.getTime() > 0 ? endedAt.toLocaleString() : 'the deadline';
          this.timeExpiredMessage = `Time ended at ${endedAtText}. Your quiz is being submitted automatically.`;
          this.submitQuiz(true);
          alert(this.timeExpiredMessage);
        }
      } else {
        const diff = end - now;
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        this.remainingTime = `${m}:${s.toString().padStart(2, '0')}`;
      }
    };

    updateTimer(); // Initial call to avoid 1s delay
    this.quizTimer = setInterval(updateTimer, 1000);
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.selectedQuizQuestions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  jumpToQuestion(index: number): void {
    if (index >= 0 && index < this.selectedQuizQuestions.length) {
      this.currentQuestionIndex = index;
      this.reviewMode = false;
    }
  }

  chooseAnswer(questionId: number, option: string): void {
    this.selectedAnswers[questionId] = option;
  }

  getSelectedAnswer(questionId: number): string {
    return this.selectedAnswers[questionId] || '';
  }

  getAnsweredCount(): number {
    return this.selectedQuizQuestions.filter(question => !!this.selectedAnswers[question.id]).length;
  }

  getProgressPercent(): number {
    if (!this.selectedQuizQuestions.length) {
      return 0;
    }
    return Math.round((this.getAnsweredCount() / this.selectedQuizQuestions.length) * 100);
  }

  canSubmitQuiz(): boolean {
    if (!this.selectedQuizQuestions.length) return false;
    return this.selectedQuizQuestions.every(question => !!this.selectedAnswers[question.id]);
  }

  enterReviewMode(): void {
    if (!this.canSubmitQuiz()) {
      this.quizError = 'Please answer all questions before reviewing.';
      return;
    }
    this.quizError = '';
    this.reviewMode = true;
  }

  backToQuiz(): void {
    this.reviewMode = false;
  }

  submitQuiz(isAuto = false): void {
    if (!this.selectedQuiz || (!isAuto && !this.canSubmitQuiz())) {
      this.quizError = 'Please answer all questions before submitting.';
      return;
    }

    const answers: QuizAnswerSubmission[] = this.selectedQuizQuestions.map(question => ({
      questionId: question.id,
      selectedOption: this.selectedAnswers[question.id]
    }));

    this.submittingQuiz = true;
    this.quizError = '';
    this.quizService.submitQuiz(this.userId, this.selectedQuiz.id, answers, isAuto).subscribe({
      next: (result) => {
        this.quizResult = {
          score: result.score,
          passed: result.passed,
          message: result.message
        };
        if (isAuto && this.timeExpiredMessage) {
          this.quizError = this.timeExpiredMessage;
        }
        this.submittingQuiz = false;
      },
      error: () => {
        this.submittingQuiz = false;
        this.quizError = 'Quiz submission failed.';
      }
    });
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

  // ── Progress Helper Methods ──
  getStageIcon(stage: ProgressStage): string {
    return this.stageIcons[stage] || 'fa-solid fa-circle-info';
  }

  getStageLabel(stage: ProgressStage): string {
    return this.stageLabels[stage] || stage;
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
    if (type === 'diploma') this.diplomaFile = file;
    if (type === 'transcript') this.transcriptFile = file;
    if (type === 'coverletter') this.coverLetterFile = file;
    if (type === 'other') this.otherFile = file;
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
  
  uploadDiploma(): void {
    if (!this.diplomaFile) { this.uploadError = 'Please select a file.'; return; }
    this.isUploading = true;
    this.uploadError = '';
    this.uploadSuccess = '';
    this.documentService.uploadDiploma(
      this.userId, this.diplomaFile,
      this.diplomaForm.degree, this.diplomaForm.institution,
      this.diplomaForm.graduationYear, this.diplomaForm.fieldOfStudy
    ).subscribe({
      next: () => {
        this.uploadSuccess = 'Diploma uploaded successfully!';
        this.isUploading = false;
        this.diplomaFile = null;
        this.diplomaForm = { degree: '', institution: '', graduationYear: '', fieldOfStudy: '' };
        this.loadDocuments();
      },
      error: (err: { error?: { message?: string } }) => {
        this.uploadError = err?.error?.message || 'Upload failed.';
        this.isUploading = false;
      }
    });
  }

  uploadTranscript(): void {
    if (!this.transcriptFile) { this.uploadError = 'Please select a file.'; return; }
    this.isUploading = true;
    this.uploadError = '';
    this.uploadSuccess = '';
    this.documentService.uploadTranscript(
      this.userId, this.transcriptFile,
      this.transcriptForm.institution, this.transcriptForm.academicYear, this.transcriptForm.average
    ).subscribe({
      next: () => {
        this.uploadSuccess = 'Transcript uploaded successfully!';
        this.isUploading = false;
        this.transcriptFile = null;
        this.transcriptForm = { institution: '', academicYear: '', average: '' };
        this.loadDocuments();
      },
      error: (err: { error?: { message?: string } }) => {
        this.uploadError = err?.error?.message || 'Upload failed.';
        this.isUploading = false;
      }
    });
  }

  uploadCoverLetter(): void {
    if (!this.coverLetterFile) { this.uploadError = 'Please select a file.'; return; }
    this.isUploading = true;
    this.uploadError = '';
    this.uploadSuccess = '';
    this.documentService.uploadCoverLetter(
      this.userId, this.coverLetterFile,
      this.coverLetterForm.targetUniversity, this.coverLetterForm.targetProgram, this.coverLetterForm.content
    ).subscribe({
      next: () => {
        this.uploadSuccess = 'Cover letter uploaded successfully!';
        this.isUploading = false;
        this.coverLetterFile = null;
        this.coverLetterForm = { targetUniversity: '', targetProgram: '', content: '' };
        this.loadDocuments();
      },
      error: (err: { error?: { message?: string } }) => {
        this.uploadError = err?.error?.message || 'Upload failed.';
        this.isUploading = false;
      }
    });
  }

  uploadOtherDoc(): void {
    if (!this.otherFile) { this.uploadError = 'Please select a file.'; return; }
    this.isUploading = true;
    this.uploadError = '';
    this.uploadSuccess = '';
    this.documentService.uploadOther(
      this.userId, this.otherFile,
      this.otherForm.documentTitle, this.otherForm.notes
    ).subscribe({
      next: () => {
        this.uploadSuccess = 'Document uploaded successfully!';
        this.isUploading = false;
        this.otherFile = null;
        this.otherForm = { documentTitle: '', notes: '' };
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
    if (status === 'APPROVED') return 'Approved';
    if (status === 'REJECTED') return 'Rejected';
    return 'Pending';
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

  getQuizStartTime(quiz: any): Date {
    const val = quiz?.startTime || quiz?.start_time || quiz?.startDate || quiz?.start || 
                quiz?.startsAt || quiz?.starts_at || quiz?.startingDate || quiz?.openingDate;
    return this.parseDate(val);
  }

  getQuizEndTime(quiz: any): Date {
    const val = quiz?.endTime || quiz?.end_time || quiz?.endDate || quiz?.end || 
                quiz?.endsAt || quiz?.ends_at || quiz?.deadline || quiz?.endingDate || quiz?.closingDate;
    return this.parseDate(val);
  }

  hasValidTiming(quiz: any): boolean {
    if (!quiz) return false;
    // Extract values with fallbacks for potential naming variations from backend
    const startVal = this.getQuizStartTime(quiz);
    const endVal = this.getQuizEndTime(quiz);
    
    const start = startVal.getTime();
    const end = endVal.getTime();
    return start > 0 && end > 0;
  }

  parseDate(dateInput: any): Date {
    // If input is null, undefined, or empty string, return a zero date
    if (dateInput === null || dateInput === undefined || dateInput === '') return new Date(0);
    
    // If it's already a Date object
    if (dateInput instanceof Date) return dateInput;

    // Handle case where backend might return date as an array [yyyy, mm, dd, hh, mm]
    // Some Java/Spring Boot backends return LocalDateTime as an array
    if (Array.isArray(dateInput)) {
      if (dateInput.length < 3) return new Date(0);
      return new Date(
        dateInput[0],
        (dateInput[1] || 1) - 1,
        dateInput[2],
        dateInput[3] || 0,
        dateInput[4] || 0
      );
    }

    // Try direct parsing
    let d = new Date(dateInput);
    
    // If direct parsing fails and it's a string, try fixing common ISO issues
    if (isNaN(d.getTime()) && typeof dateInput === 'string') {
      // Replace space with T (e.g., "2024-04-13 18:00" -> "2024-04-13T18:00")
      const isoStr = dateInput.replace(' ', 'T');
      d = new Date(isoStr);
    }

    return isNaN(d.getTime()) ? new Date(0) : d;
  }

  getQuizStatus(quiz: any): 'Upcoming' | 'Active' | 'Expired' {
    if (!this.hasValidTiming(quiz)) return 'Active';
    const now = new Date().getTime();
    const start = this.getQuizStartTime(quiz).getTime();
    const end = this.getQuizEndTime(quiz).getTime();
    if (now < start) return 'Upcoming';
    if (now >= end) return 'Expired';
    return 'Active';
  }

  parseLanguages(json: string): { name: string; level: string; rank: number }[] {
    try { return JSON.parse(json); } catch { return []; }
  }

  ngOnDestroy(): void {
    if (this.quizTimer) clearInterval(this.quizTimer);
  }
}