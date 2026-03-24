import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Destination } from '../../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class DestinationService {
  private readonly apiBaseUrl = 'http://localhost:8080';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Destination[]> {
    return this.http.get<Destination[]>(
      `${this.apiBaseUrl}/api/admin/destinations`
    );
  }

  getById(id: number): Observable<Destination> {
    return this.http.get<Destination>(
      `${this.apiBaseUrl}/api/admin/destinations/${id}`
    );
  }

  create(destination: Partial<Destination>): Observable<{ id: number; message: string }> {
    return this.http.post<{ id: number; message: string }>(
      `${this.apiBaseUrl}/api/admin/destinations`,
      destination
    );
  }

  update(id: number, destination: Partial<Destination>): Observable<{ id: number; message: string }> {
    return this.http.put<{ id: number; message: string }>(
      `${this.apiBaseUrl}/api/admin/destinations/${id}`,
      destination
    );
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiBaseUrl}/api/admin/destinations/${id}`
    );
  }
}