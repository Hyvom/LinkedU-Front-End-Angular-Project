import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminDashboardStatistics, ProductKey, User } from '../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly base = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getDashboardStatistics(): Observable<AdminDashboardStatistics> {
    return this.http.get<AdminDashboardStatistics>(`${this.base}/statistics`);
  }

  // ── Users ─────────────────────────────────────────────
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/users`);
  }

  assignRole(userId: number, role: string): Observable<any> {
    return this.http.put<any>(
      `${this.base}/users/${userId}/role`,
      null,
      { params: { role } }
    );
  }

  assignAgentToStudent(studentId: number, agentId: number): Observable<any> {
    return this.http.post<any>(
      `http://localhost:8080/api/students/assign-agent`,
      null,
      { params: { studentId: studentId.toString(), agentId: agentId.toString() } }
    );
  }
  // ── Product Keys ─────────────────────────────────────
  createProductKeys(quantity: number): Observable<ProductKey[]> {
    const requests: Observable<ProductKey>[] = [];
    for (let i = 0; i < quantity; i++) {
      const keyValue = this.generateKey();
      requests.push(
        this.http.post<ProductKey>(`${this.base}/product-keys`, keyValue, {
          headers: { 'Content-Type': 'text/plain' }
        })
      );
    }
    return new Observable(observer => {
      const results: ProductKey[] = [];
      let completed = 0;
      requests.forEach(req => {
        req.subscribe({
          next: (key: ProductKey) => {
            results.push(key);
            completed++;
            if (completed === requests.length) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (err: unknown) => observer.error(err)
        });
      });
    });
  }

  private generateKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => Array.from({ length: 3 }, () =>
      chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${segment()}-${segment()}`;
  }

  getAvailableProductKeys(): Observable<ProductKey[]> {
    return this.http.get<ProductKey[]>(`${this.base}/product-keys/available`);
  }
}