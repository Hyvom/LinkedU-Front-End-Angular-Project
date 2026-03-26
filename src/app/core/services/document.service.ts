import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentDocument } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly api = 'http://localhost:8080/api/documents';

  constructor(private readonly http: HttpClient) {}

  getStudentDocuments(studentId: number): Observable<StudentDocument[]> {
    return this.http.get<StudentDocument[]>(`${this.api}/student/${studentId}`);
  }

  uploadCv(studentId: number, file: File, summary: string, experience: string, skills: string): Observable<StudentDocument> {
    const form = new FormData();
    form.append('studentId', String(studentId));
    form.append('file', file);
    form.append('summary', summary);
    form.append('experience', experience);
    form.append('skills', skills);
    return this.http.post<StudentDocument>(`${this.api}/cv`, form);
  }

  uploadPassport(studentId: number, file: File, issueDate: string, expiryDate: string, issuingCountry: string): Observable<StudentDocument> {
    const form = new FormData();
    form.append('studentId', String(studentId));
    form.append('file', file);
    form.append('issueDate', issueDate);
    form.append('expiryDate', expiryDate);
    form.append('issuingCountry', issuingCountry);
    return this.http.post<StudentDocument>(`${this.api}/passport`, form);
  }

  uploadIdCard(studentId: number, file: File, numId: string, birthday: string): Observable<StudentDocument> {
    const form = new FormData();
    form.append('studentId', String(studentId));
    form.append('file', file);
    form.append('numId', numId);
    form.append('birthday', birthday);
    return this.http.post<StudentDocument>(`${this.api}/id-card`, form);
  }
}