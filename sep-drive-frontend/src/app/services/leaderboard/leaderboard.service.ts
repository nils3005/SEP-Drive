import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {leaderboard} from '../../types';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private http = inject(HttpClient);
  private url: string = 'http://localhost:8080/leaderboard';


  getLeaderboard(): Observable<leaderboard[]> {
    return this.http.get<leaderboard[]>(this.url);
  }
}
