import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AgentProfileDTO, AgentProfileResponse } from '../../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class AgentProfileService {
  private readonly apiBaseUrl = 'http://localhost:8080';

  constructor(private readonly http: HttpClient) {}

  getMyProfile(): Observable<AgentProfileResponse> {
    return this.http.get<AgentProfileResponse>(
      `${this.apiBaseUrl}/api/agent-profile/me`
    );
  }

  createProfile(dto: AgentProfileDTO): Observable<{ message: string; profileId: number }> {
    return this.http.post<{ message: string; profileId: number }>(
      `${this.apiBaseUrl}/api/agent-profile/create`,
      dto
    );
  }

  updateProfile(dto: AgentProfileDTO): Observable<{ message: string; profileId: number }> {
    return this.http.put<{ message: string; profileId: number }>(
      `${this.apiBaseUrl}/api/agent-profile/update`,
      dto
    );
  }

  uploadAvatar(file: File): Observable<{ message: string; avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string; avatarUrl: string }>(
      `${this.apiBaseUrl}/api/agent-profile/upload-avatar`,
      formData
    );
  }
}