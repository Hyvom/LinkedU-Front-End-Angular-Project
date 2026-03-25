import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { routes } from '../../app/app.routes';
import { chatbotConfig } from '../config/chatbot.config';

interface GroqChoice {
  message?: {
    content?: string;
  };
}

interface GroqResponse {
  choices?: GroqChoice[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  constructor(
    private readonly http: HttpClient,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  ask(question: string): Observable<string> {
    if (!chatbotConfig.groqApiKey.trim()) {
      return of('Groq API key is missing. Please add it in chatbot config.');
    }

    return this.buildWebsiteContext().pipe(
      map((context) => ({
        model: chatbotConfig.model,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              'You are the LinkedU website assistant. Answer only from the provided Website Context. If the answer is not clearly present in the context, reply exactly: "I can only answer based on the current website information." Keep answers short and practical.'
          },
          {
            role: 'user',
            content: `Website Context:\n${context}\n\nQuestion: ${question}`
          }
        ]
      })),
      switchMap((payload) =>
        this.http.post<GroqResponse>(chatbotConfig.apiUrl, payload, {
          headers: {
            Authorization: `Bearer ${chatbotConfig.groqApiKey}`,
            'Content-Type': 'application/json'
          }
        })
      ),
      map((response) => {
        const content = response.choices?.[0]?.message?.content?.trim();
        return content || 'I can only answer based on the current website information.';
      }),
      catchError(() => of('I can only answer based on the current website information.'))
    );
  }

  private buildWebsiteContext(): Observable<string> {
    const routeContext = routes
      .filter((route) => !!route.path && route.path !== '**')
      .map((route) => `- /${route.path}`)
      .join('\n');

    const currentPageText = (this.document.body?.innerText ?? '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 4000);

    return this.http.get('/server-infos.txt', { responseType: 'text' }).pipe(
      map((serverInfos) => [
        'Server infos from file:',
        serverInfos.trim() || '- none',
        '',
        'Known routes:',
        routeContext || '- none',
        '',
        'Current visible page text:',
        currentPageText || '- none'
      ].join('\n')),
      catchError(() =>
        of([
          'Server infos from file:',
          '- none',
          '',
          'Known routes:',
          routeContext || '- none',
          '',
          'Current visible page text:',
          currentPageText || '- none'
        ].join('\n'))
      )
    );
  }
}
