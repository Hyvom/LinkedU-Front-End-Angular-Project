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
  quizzes: Quiz[] = [];
  selectedQuizId: number | null = null;
  selectedQuizQuestions: QuizQuestion[] = [];
  createdQuiz: Quiz | null = null;
  createdQuestionsCount = 0;
  questionCursor = 1;

  loading = false;
  savingQuiz = false;
  savingQuestion = false;
  errorMsg = '';
  successMsg = '';

  quizForm: CreateQuizPayload = {
    title: '',
    description: '',
    language: ''
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
      next: (quizzes) => {
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
    if (!this.quizForm.title.trim() || !this.quizForm.language.trim()) {
      this.errorMsg = 'Quiz title and language are required.';
      return;
    }

    this.savingQuiz = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.quizService.createQuiz(this.quizForm, this.teacherId).subscribe({
      next: (quiz) => {
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
    this.quizForm = { title: '', description: '', language: '' };
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

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
