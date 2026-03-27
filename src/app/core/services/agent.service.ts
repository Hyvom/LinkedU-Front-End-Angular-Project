import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AssignedStudent,
  DocumentResponseDTO,
  Progress,
  AgentProfileResponse
} from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class AgentService {
  private readonly api = 'http://localhost:8080';

  constructor(private readonly http: HttpClient) {}

  // ── Students ──
  getMyStudents(agentId: number): Observable<AssignedStudent[]> {
    return this.http.get<AssignedStudent[]>(
      `${this.api}/api/students/agent/${agentId}/students`
    );
  }

  // ── Documents ──
  getStudentDocuments(studentId: number): Observable<DocumentResponseDTO[]> {
    return this.http.get<DocumentResponseDTO[]>(
      `${this.api}/api/documents/student/${studentId}`
    );
  }

  verifyDocument(
    documentId: number,
    agentId: number,
    status: 'APPROVED' | 'REJECTED'
  ): Observable<DocumentResponseDTO> {
    return this.http.put<DocumentResponseDTO>(
      `${this.api}/api/documents/${documentId}/verify?agentId=${agentId}`,
      { status }
    );
  }

  // ── Progress ──
  getStudentProgress(studentId: number): Observable<Progress[]> {
    return this.http.get<Progress[]>(
      `${this.api}/api/progress/student/${studentId}`
    );
  }

  createProgress(studentId: number, stage: string): Observable<Progress> {
    return this.http.post<Progress>(
      `${this.api}/api/progress?studentId=${studentId}&stage=${stage}`,
      {}
    );
  }

  updateProgressStatus(progressId: number, status: string): Observable<Progress> {
    return this.http.put<Progress>(
      `${this.api}/api/progress/${progressId}/status/${status}?status=${status}`,
      {}
    );
  }

  // ── Student Profile ──
  getStudentProfile(studentId: number): Observable<any> {
    return this.http.get<any>(
      `${this.api}/api/student-profile/${studentId}`
    );
  }

  // ── Agent Profile ──
  getMyAgentProfile(): Observable<any> {
    return this.http.get<any>(
      `${this.api}/api/agent-profile/me`
    );
  }

}