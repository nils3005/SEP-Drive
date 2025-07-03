import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StatisticsDto } from '../../types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private baseUrl = 'http://localhost:8080/statistics';

  constructor(private http: HttpClient) {}

  getDailyStatistics(start: number, end: number): Observable<StatisticsDto[]> {
    return this.http.get<StatisticsDto[]>(`${this.baseUrl}/daily/${start}/${end}`);
  }

  getMonthlyStatistics(start: number, end: number): Observable<StatisticsDto[]> {
    return this.http.get<StatisticsDto[]>(`${this.baseUrl}/monthly/${start}/${end}`);
  }
}
