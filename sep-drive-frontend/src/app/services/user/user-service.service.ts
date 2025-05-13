import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable, of} from "rxjs";
import {User} from "../../types";

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  private http = inject(HttpClient);
  private url: string = 'http://localhost:8080/users'; // TODO ändern für docker?

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.url);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(this.url + '/' + id);
  }

}
