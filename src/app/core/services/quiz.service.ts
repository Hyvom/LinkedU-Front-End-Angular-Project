import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateQuizPayload, QuestionFormPayload, Quiz, QuizAnswerSubmission, QuizQuestion, QuizSubmitResponse } from '../../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private readonly apiBase = 'http://localhost:8080/api';

  constructor(private readonly http: HttpClient) {}

  createQuiz(payload: CreateQuizPayload, createdById: number): Observable<Quiz> {
    return this.http.post<Quiz>(`${this.apiBase}/quizzes`, null, {
      params: {
        title: payload.title,
        description: payload.description,
        language: payload.language,
        startTime: payload.startTime || '',
        endTime: payload.endTime || '',
        createdById: createdById.toString()
      }
    });
  }

  getTeacherQuizzes(teacherId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiBase}/quizzes/teacher/${teacherId}`);
  }

  getAllQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiBase}/quizzes`);
  }

  updateQuizAsAdmin(quizId: number, adminId: number, payload: CreateQuizPayload): Observable<Quiz> {
    return this.http.put<Quiz>(`${this.apiBase}/quizzes/${quizId}`, null, {
      params: {
        adminId: adminId.toString(),
        title: payload.title,
        description: payload.description,
        language: payload.language,
        startTime: payload.startTime || '',
        endTime: payload.endTime || ''
      }
    });
  }

  deleteQuizAsAdmin(quizId: number, adminId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBase}/quizzes/${quizId}`, {
      params: { adminId: adminId.toString() }
    });
  }

  createQuestion(teacherId: number, payload: QuestionFormPayload): Observable<QuizQuestion> {
    return this.http.post<QuizQuestion>(`${this.apiBase}/questions`, payload, {
      params: { teacherId: teacherId.toString() }
    });
  }

  getTeacherQuizQuestions(quizId: number, teacherId: number): Observable<QuizQuestion[]> {
    return this.http.get<QuizQuestion[]>(`${this.apiBase}/questions/quiz/${quizId}`, {
      params: { teacherId: teacherId.toString() }
    });
  }

  getAssignedQuizzes(studentId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiBase}/student-quiz/assigned`, {
      params: { studentId: studentId.toString() }
    });
  }

  getQuizQuestionsForStudent(quizId: number, studentId: number): Observable<QuizQuestion[]> {
    return this.http.get<QuizQuestion[]>(`${this.apiBase}/student-quiz/quiz/${quizId}/questions`, {
      params: { studentId: studentId.toString() }
    });
  }

  submitQuiz(studentId: number, quizId: number, answers: QuizAnswerSubmission[], auto = false): Observable<QuizSubmitResponse> {
    return this.http.post<QuizSubmitResponse>(`${this.apiBase}/student-quiz/submit`, answers, {
      params: {
        studentId: studentId.toString(),
        quizId: quizId.toString(),
        auto: auto ? 'true' : 'false'
      }
    });
  }
}
