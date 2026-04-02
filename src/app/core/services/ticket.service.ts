import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Ticket,
  CreateTicketDTO,
  AcceptTicketDTO,
  RejectTicketDTO
} from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly api = 'http://localhost:8080';

  constructor(private readonly http: HttpClient) {}

  // ── Student ──
  createTicket(dto: CreateTicketDTO): Observable<{ ticketId: number; message: string }> {
    return this.http.post<{ ticketId: number; message: string }>(
      `${this.api}/api/student/tickets`, dto
    );
  }

  getMyTicketsAsStudent(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.api}/api/student/tickets`);
  }

  // ── Agent ──
  getMyTicketsAsAgent(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.api}/api/agent/tickets`);
  }

  acceptTicket(ticketId: number, dto: AcceptTicketDTO): Observable<{ message: string; meetLink: string }> {
    return this.http.post<{ message: string; meetLink: string }>(
      `${this.api}/api/agent/tickets/${ticketId}/accept`, dto
    );
  }

  rejectTicket(ticketId: number, dto: RejectTicketDTO): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.api}/api/agent/tickets/${ticketId}/reject`, dto
    );
  }

  addResponse(ticketId: number, response: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.api}/api/agent/tickets/${ticketId}/response`,
      { response }
    );
  }
}