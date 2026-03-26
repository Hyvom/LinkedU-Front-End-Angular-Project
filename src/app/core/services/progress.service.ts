import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Progress } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly api = 'http://localhost:8080/api/progress';

  constructor(private readonly http: HttpClient) {}

  getStudentProgress(studentId: number): Observable<Progress[]> {
    return this.http.get<Progress[]>(`${this.api}/student/${studentId}`);
  }
}