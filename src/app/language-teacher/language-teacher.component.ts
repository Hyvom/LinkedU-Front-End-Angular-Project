import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { QuizService } from '../core/services/quiz.service';
import { CreateQuizPayload, QuestionFormPayload, Quiz, QuizQuestion } from '../shared/models/models';

@Component({
  selector: 'app-language-teacher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './language-teacher.component.html',
  styleUrl: './language-teacher.component.css'
})
export class LanguageTeacherComponent implements OnInit {
  readonly languageOptions = [
    'French',
    'English',
    'Spanish',
    'German',
    'Italian',
    'Arabic',
    'Portuguese',
    'Chinese',
    'Turkish',
    'Russian'
  ];

  currentStep: 1 | 2 | 3 = 1;
  teacherId = 0;
  quizzes: (Quiz & { startTime?: string; endTime?: string })[] = [];
  selectedQuizId: number | null = null;
  selectedQuizQuestions: QuizQuestion[] = [];
  createdQuiz: (Quiz & { startTime?: string; endTime?: string }) | null = null;
  createdQuestionsCount = 0;
  questionCursor = 1;

  loading = false;
  savingQuiz = false;
  savingQuestion = false;
  errorMsg = '';
  successMsg = '';

  quizForm: CreateQuizPayload & { startTime?: string; endTime?: string } = {
    title: '',
    description: '',
    language: '',
    startTime: '',
    endTime: ''
  };

  questionForm: QuestionFormPayload = {
    quizId: 0,
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A'
  };

  constructor(
    private readonly authService: AuthService,
    private readonly quizService: QuizService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.authService.getUserId());
    if (!id) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.teacherId = id;
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.loading = true;
    this.errorMsg = '';
    this.quizService.getTeacherQuizzes(this.teacherId).subscribe({
      next: (quizzes: any) => {
        this.quizzes = quizzes;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Failed to load your quizzes.';
      }
    });
  }

  createQuiz(): void {
    if (!this.quizForm.title.trim() || !this.quizForm.language.trim() || !this.quizForm.startTime || !this.quizForm.endTime) {
      this.errorMsg = 'Quiz title, language, start time, and end time are required.';
      return;
    }

    const start = new Date(this.quizForm.startTime);
    const end = new Date(this.quizForm.endTime);

    if (end <= start) {
      this.errorMsg = 'End time must be after start time.';
      return;
    }

    this.savingQuiz = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.quizService.createQuiz(this.quizForm, this.teacherId).subscribe({
      next: (quiz: any) => {
        this.savingQuiz = false;
        this.createdQuiz = quiz;
        this.selectedQuizId = quiz.id;
        this.questionForm.quizId = quiz.id;
        this.currentStep = 2;
        this.createdQuestionsCount = 0;
        this.questionCursor = 1;
        this.successMsg = 'Quiz created. Add your questions and pick the correct answer for each one.';
        this.quizzes = [quiz, ...this.quizzes];
      },
      error: () => {
        this.savingQuiz = false;
        this.errorMsg = 'Failed to create quiz.';
      }
    });
  }

  selectQuiz(quizId: number): void {
    this.selectedQuizId = quizId;
    this.createdQuiz = this.quizzes.find(q => q.id === quizId) ?? null;
    this.questionForm.quizId = quizId;
    this.currentStep = 2;
    this.loadQuizQuestions(quizId);
  }

  loadQuizQuestions(quizId: number): void {
    this.quizService.getTeacherQuizQuestions(quizId, this.teacherId).subscribe({
      next: (questions) => {
        this.selectedQuizQuestions = questions;
      },
      error: () => {
        this.selectedQuizQuestions = [];
      }
    });
  }

  private isQuestionFormValid(): boolean {
    return !!(
      this.questionForm.quizId &&
      this.questionForm.questionText.trim() &&
      this.questionForm.optionA.trim() &&
      this.questionForm.optionB.trim() &&
      this.questionForm.optionC.trim() &&
      this.questionForm.optionD.trim() &&
      this.questionForm.correctOption
    );
  }

  private submitQuestion(afterSave: 'next' | 'finish'): void {
    if (!this.questionForm.quizId) {
      this.errorMsg = 'Select a quiz first.';
      return;
    }

    if (!this.isQuestionFormValid()) {
      this.errorMsg = 'Please fill question text, all 4 options, and choose the correct answer.';
      return;
    }

    this.savingQuestion = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.quizService.createQuestion(this.teacherId, this.questionForm).subscribe({
      next: () => {
        this.savingQuestion = false;
        this.createdQuestionsCount++;
        this.questionCursor++;
        this.successMsg = `Question ${this.createdQuestionsCount} saved.`;
        this.questionForm = {
          quizId: this.questionForm.quizId,
          questionText: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          correctOption: 'A'
        };
        this.loadQuizQuestions(this.questionForm.quizId);
        if (afterSave === 'finish') {
          this.currentStep = 3;
          this.successMsg = `Quiz completed with ${this.createdQuestionsCount} question(s).`;
        }
      },
      error: () => {
        this.savingQuestion = false;
        this.errorMsg = 'Failed to create question.';
      }
    });
  }

  addQuestionAndContinue(): void {
    this.submitQuestion('next');
  }

  addQuestionAndFinish(): void {
    this.submitQuestion('finish');
  }

  startNewQuizFlow(): void {
    this.currentStep = 1;
    this.createdQuiz = null;
    this.selectedQuizId = null;
    this.selectedQuizQuestions = [];
    this.createdQuestionsCount = 0;
    this.questionCursor = 1;
    this.quizForm = { 
      title: '', 
      description: '', 
      language: '',
      startTime: '',
      endTime: ''
    };
    this.questionForm = {
      quizId: 0,
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A'
    };
  }

  goToStep(step: 1 | 2 | 3): void {
    if (step > 1 && !this.selectedQuizId) {
      return;
    }
    this.currentStep = step;
  }

  /**
   * Robustly extracts a start date from a quiz object using various common naming conventions.
   */
  private getQuizStartDate(quiz: any): Date {
    const val = quiz?.startTime || quiz?.start_time || quiz?.startDate || quiz?.start || 
                quiz?.startsAt || quiz?.starts_at || quiz?.startingDate || quiz?.openingDate;
    return this.parseDate(val);
  }

  /**
   * Robustly extracts an end date from a quiz object using various common naming conventions.
   */
  private getQuizEndDate(quiz: any): Date {
    const val = quiz?.endTime || quiz?.end_time || quiz?.endDate || quiz?.end || 
                quiz?.endsAt || quiz?.ends_at || quiz?.deadline || quiz?.endingDate || quiz?.closingDate;
    return this.parseDate(val);
  }

  private parseDate(dateInput: any): Date {
    if (dateInput === null || dateInput === undefined || dateInput === '') return new Date(0);
    if (dateInput instanceof Date) return dateInput;
    if (Array.isArray(dateInput)) {
      if (dateInput.length < 3) return new Date(0);
      return new Date(dateInput[0], (dateInput[1] || 1) - 1, dateInput[2], dateInput[3] || 0, dateInput[4] || 0);
    }
    let d = new Date(dateInput);
    if (isNaN(d.getTime()) && typeof dateInput === 'string') {
      const isoStr = dateInput.replace(' ', 'T');
      d = new Date(isoStr);
    }
    return isNaN(d.getTime()) ? new Date(0) : d;
  }

  hasValidTiming(quiz: any): boolean {
    if (!quiz) return false;
    return this.getQuizStartDate(quiz).getTime() > 0 && this.getQuizEndDate(quiz).getTime() > 0;
  }

  getQuizStatus(quiz: any): 'Upcoming' | 'Active' | 'Expired' {
    if (!this.hasValidTiming(quiz)) return 'Active';
    
    const now = new Date().getTime();
    const start = this.getQuizStartDate(quiz).getTime();
    const end = this.getQuizEndDate(quiz).getTime();
    if (now < start) return 'Upcoming';
    if (now > end) return 'Expired';
    return 'Active';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
