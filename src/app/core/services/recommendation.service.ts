import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RecommendationRequest {
  country?: string;
  skills?: string;
  major?: string;
  moyenne?: number | string;
  language?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private http = inject(HttpClient);
  // Replace with your Flask API URL if different
  private apiUrl = 'http://localhost:5000/';

  getRecommendations(data: RecommendationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/predict`, data);
  }
}