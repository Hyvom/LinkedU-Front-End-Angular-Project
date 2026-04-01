import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessage } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly api = 'http://localhost:8080/api/chat';

  constructor(private readonly http: HttpClient) {}

  sendMessage(senderId: number, receiverId: number, message: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(
      `${this.api}?senderId=${senderId}&receiverId=${receiverId}&message=${encodeURIComponent(message)}`,
      {}
    );
  }

  getConversation(user1Id: number, user2Id: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.api}/conversation?user1Id=${user1Id}&user2Id=${user2Id}`
    );
  }

  markAsSeen(messageId: number): Observable<ChatMessage> {
    return this.http.put<ChatMessage>(`${this.api}/${messageId}/seen`, {});
  }

  getUnreadMessages(userId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.api}/unread/${userId}`);
  }
}