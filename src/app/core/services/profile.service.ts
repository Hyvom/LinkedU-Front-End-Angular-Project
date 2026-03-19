import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentProfileDTO, StudentProfileResponse } from '../../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly apiBaseUrl = 'http://localhost:8080';

  constructor(private readonly http: HttpClient) {}

  getMyProfile(): Observable<StudentProfileResponse> {
    return this.http.get<StudentProfileResponse>(
      `${this.apiBaseUrl}/api/student-profile/me`
    );
  }

  createProfile(dto: StudentProfileDTO): Observable<{ message: string; profileId: number }> {
    return this.http.post<{ message: string; profileId: number }>(
      `${this.apiBaseUrl}/api/student-profile/create`,
      dto
    );
  }

  updateProfile(dto: StudentProfileDTO): Observable<{ message: string; profileId: number }> {
    return this.http.put<{ message: string; profileId: number }>(
      `${this.apiBaseUrl}/api/student-profile/update`,
      dto
    );
  }

  uploadAvatar(file: File): Observable<{ message: string; avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string; avatarUrl: string }>(
      `${this.apiBaseUrl}/api/student-profile/upload-avatar`,
      formData
    );
  }
}