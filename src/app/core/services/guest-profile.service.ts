import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GuestProfileDTO, GuestProfileResponse } from '../../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class GuestProfileService {
  private readonly apiBaseUrl = 'http://localhost:8080';

  constructor(private readonly http: HttpClient) {}

  getMyProfile(): Observable<GuestProfileResponse> {
    return this.http.get<GuestProfileResponse>(
      `${this.apiBaseUrl}/api/guest-profile/me`
    );
  }

  createProfile(dto: GuestProfileDTO): Observable<{ message: string; profileId: number }> {
    return this.http.post<{ message: string; profileId: number }>(
      `${this.apiBaseUrl}/api/guest-profile/create`,
      dto
    );
  }

  updateProfile(dto: GuestProfileDTO): Observable<{ message: string; profileId: number }> {
    return this.http.put<{ message: string; profileId: number }>(
      `${this.apiBaseUrl}/api/guest-profile/update`,
      dto
    );
  }

  uploadAvatar(file: File): Observable<{ message: string; avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string; avatarUrl: string }>(
      `${this.apiBaseUrl}/api/guest-profile/upload-avatar`,
      formData
    );
  }
}