// src/app/services/auth.service.ts
import {inject, Injectable} from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {User} from "../../types";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User|null>(null);
  public user$: Observable<User|null> = this.userSubject.asObservable();
  private http = inject(HttpClient);
  private url: string = 'http://localhost:8080/auth'

  /** Gibt true zurück, wenn userSubject aktuell einen Wert ≠ null hat */
  public isLoggedIn$: Observable<boolean> = this.user$.pipe(
      map(u => !!u)
  );

  login(credentials: { username: string, password: string }): Observable<User> {
    return this.http.post<User>(this.url + '/login', credentials)
        .pipe(
            tap(user => {
              this.userSubject.next(user);
            })
        );
  }

  logout(): void {
    this.http.post<User>(this.url + '/logout', this.userSubject.getValue());
    this.userSubject.next(null);
  }
}
