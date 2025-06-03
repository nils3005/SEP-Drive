import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {fahrt} from "../../types";




@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private http = inject(HttpClient);
  private url: string = 'http://localhost:8080/history';



  getHistory(): Observable<fahrt[]> {
    return this.http.get<fahrt[]>(this.url);
  }
}
