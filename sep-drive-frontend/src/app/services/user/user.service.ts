import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable, of} from "rxjs";
import {User} from "../../types";
import {AuthService} from "../auth/auth-service.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private url: string = 'http://localhost:8080/users'; // TODO ändern für docker?

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.url);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(this.url + '/' + id);
  }

  getUserByUsername(name: string) {
    return this.http.get<User>(this.url + '/username/' + name);
  }

}
