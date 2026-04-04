import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { QuizService } from '../../core/services/quiz.service';
import { CreateQuizPayload, Quiz } from '../../shared/models/models';

@Component({
  selector: 'app-admin-quizzes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quizzes.component.html',
  styleUrl: './quizzes.component.css'
})
export class QuizzesComponent implements OnInit {
  quizzes: Quiz[] = [];
  searchTerm = '';
  selectedLanguage = 'ALL';
  loading = false;
  errorMsg = '';
  successMsg = '';

  adminId = 0;
  editingQuizId: number | null = null;
  editForm: CreateQuizPayload = { title: '', description: '', language: '' };

  constructor(
    private readonly quizService: QuizService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.adminId = Number(this.authService.getUserId());
    this.loadQuizzes();
  }

  get languageOptions(): string[] {
    const langs = this.quizzes
      .map(q => (q.language || '').trim())
      .filter(l => !!l);
    return ['ALL', ...Array.from(new Set(langs))];
  }

  get filteredQuizzes(): Quiz[] {
    return this.quizzes.filter(quiz => {
      const text = `${quiz.title} ${quiz.description || ''} ${quiz.language || ''}`.toLowerCase();
      const matchSearch = !this.searchTerm.trim() || text.includes(this.searchTerm.trim().toLowerCase());
      const matchLanguage = this.selectedLanguage === 'ALL' || (quiz.language || '').toLowerCase() === this.selectedLanguage.toLowerCase();
      return matchSearch && matchLanguage;
    });
  }

  loadQuizzes(): void {
    this.loading = true;
    this.errorMsg = '';
    this.quizService.getAllQuizzes().subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Failed to load quizzes.';
      }
    });
  }

  startEdit(quiz: Quiz): void {
    this.editingQuizId = quiz.id;
    this.editForm = {
      title: quiz.title,
      description: quiz.description || '',
      language: quiz.language || ''
    };
  }

  cancelEdit(): void {
    this.editingQuizId = null;
  }

  saveEdit(quizId: number): void {
    this.quizService.updateQuizAsAdmin(quizId, this.adminId, this.editForm).subscribe({
      next: () => {
        this.successMsg = 'Quiz updated.';
        this.editingQuizId = null;
        this.loadQuizzes();
      },
      error: () => {
        this.errorMsg = 'Failed to update quiz.';
      }
    });
  }

  deleteQuiz(quizId: number): void {
    this.quizService.deleteQuizAsAdmin(quizId, this.adminId).subscribe({
      next: () => {
        this.successMsg = 'Quiz deleted.';
        this.loadQuizzes();
      },
      error: () => {
        this.errorMsg = 'Failed to delete quiz.';
      }
    });
  }
}
