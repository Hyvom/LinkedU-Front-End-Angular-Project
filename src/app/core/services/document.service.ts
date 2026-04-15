import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentDocument, CvAnalysis  } from '../../shared/models/models';

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

  analyzeCvFile(file: File): Observable<CvAnalysis> {
  const form = new FormData();
  form.append('file', file);
  return this.http.post<CvAnalysis>(`${this.api}/cv/analyze`, form);
  }

  analyzeExistingCv(studentId: number): Observable<CvAnalysis> {
    return this.http.get<CvAnalysis>(`${this.api}/cv/${studentId}/analyze`);
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

  uploadDiploma(studentId: number, file: File, degree: string, institution: string, graduationYear: string, fieldOfStudy: string): Observable<any> {
    const form = new FormData();
    form.append('studentId', String(studentId));
    form.append('file', file);
    form.append('degree', degree);
    form.append('institution', institution);
    form.append('graduationYear', graduationYear);
    form.append('fieldOfStudy', fieldOfStudy);
    return this.http.post(`${this.api}/diploma`, form);
  }

  uploadTranscript(studentId: number, file: File, institution: string, academicYear: string, average: string): Observable<any> {
    const form = new FormData();
    form.append('studentId', String(studentId));
    form.append('file', file);
    form.append('institution', institution);
    form.append('academicYear', academicYear);
    form.append('average', average);
    return this.http.post(`${this.api}/transcript`, form);
  }

  uploadCoverLetter(studentId: number, file: File, targetUniversity: string, targetProgram: string, content: string): Observable<any> {
    const form = new FormData();
    form.append('studentId', String(studentId));
    form.append('file', file);
    form.append('targetUniversity', targetUniversity);
    form.append('targetProgram', targetProgram);
    form.append('content', content);
    return this.http.post(`${this.api}/cover-letter`, form);
  }

  uploadOther(studentId: number, file: File, documentTitle: string, notes: string): Observable<any> {
    const form = new FormData();
    form.append('studentId', String(studentId));
    form.append('file', file);
    form.append('documentTitle', documentTitle);
    form.append('notes', notes);
    return this.http.post(`${this.api}/other`, form);
  }

}