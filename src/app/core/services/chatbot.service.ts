import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { chatbotConfig } from '../config/chatbot.config';

interface ChatbotAnswerResponse {
  answer?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  constructor(private readonly http: HttpClient) {}

  ask(question: string): Observable<string> {
    return this.http.post<ChatbotAnswerResponse>(chatbotConfig.apiUrl, { question }).pipe(
      map((response) => response.answer?.trim() || this.fallbackAnswer(question)),
      catchError(() => of(this.fallbackAnswer(question)))
    );
  }

  private fallbackAnswer(question: string): string {
    const normalizedQuestion = question.toLowerCase();

    const answers: Array<{ keywords: string[]; answer: string }> = [
      {
        keywords: ['mission'],
        answer: 'LinkedU is an educational networking platform that connects students, teachers, agents, and administrators.'
      },
      {
        keywords: ['support', 'email'],
        answer: 'The support email is support@linkedu.com.'
      },
      {
        keywords: ['maintenance', 'next scheduled'],
        answer: 'The next scheduled maintenance is April 15, 2026 at 2AM UTC.'
      },
      {
        keywords: ['course', 'pricing'],
        answer: 'Beginner courses cost $15-30 per month, intermediate courses $30-50, and advanced programs $50-100.'
      },
      {
        keywords: ['destination', 'country'],
        answer: 'Popular destinations include the USA, Canada, the UK, and France.'
      },
      {
        keywords: ['user types', 'roles'],
        answer: 'LinkedU supports students, language teachers, agents, and administrators.'
      }
    ];

    const matched = answers.find((entry) =>
      entry.keywords.every((keyword) => normalizedQuestion.includes(keyword))
    );

    return matched?.answer || 'I can only answer based on the current website information.';
  }
}
