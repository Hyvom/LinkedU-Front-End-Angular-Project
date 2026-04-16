import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

interface ChatbotResponse {
  reply: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly apiUrl = 'http://localhost:8080/api/chatbot/chat';

  constructor(private readonly http: HttpClient) {}

  ask(message: string): Observable<string> {
    return this.http.post<ChatbotResponse>(this.apiUrl, { message }).pipe(
      map((response) => response.reply?.trim() || 'Sorry, I could not process that.'),
      catchError(() => of('I am having trouble connecting right now. Please try again.'))
    );
  }
}