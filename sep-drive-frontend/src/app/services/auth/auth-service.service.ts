// src/app/services/auth.service.ts
import {inject, Injectable, signal} from '@angular/core';
import {BehaviorSubject, Observable, map, tap, catchError, throwError, switchMap} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {User} from "../../types";
import {Router} from "@angular/router";
import {UserServiceService} from "../user/user-service.service";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User|null>(null);
  public user$: Observable<User|null> = this.userSubject.asObservable();
  private http = inject(HttpClient);
  private url: string = 'http://localhost:8080/auth';
  private router: Router = inject(Router);
  public token = signal<string | null>(localStorage.getItem('jwt'));
  /** Gibt true zurück, wenn userSubject aktuell einen Wert ≠ null hat */
  public isLoggedIn$: Observable<boolean> = this.user$.pipe(map(u => !!u));

    checkUsername(username: string, password: string): Observable<void> {
        return this.http
            .post<void>(`${this.url}/checkUsername`, { username, password});
    }

    verifyAndLogin(payload: {
        username: string;
        password: string;
        code: string;
    }): Observable<User> {
        return this.http
            .post<string>(`${this.url}/verify`, {username: payload.username, code: payload.code})
            .pipe(
                tap(jwt => {
                    this.token.set(jwt);
                    localStorage.setItem('jwt', jwt);
                }),
                // Jetzt haben wir das Token, dann rufen wir den Login-Endpunkt auf
                switchMap(() => this.http.post<User>(`${this.url}/login`, {
                    username: payload.username,
                    password: payload.password
                })),
                tap(user => {
                    this.userSubject.next(user);
                    this.router.navigate(['/']); // nach Login auf die Startseite
                }),
                catchError(err => throwError(() => new Error(err.message || 'Login fehlgeschlagen')))
            );
    }

    logout(): void {
        this.http.get<void>(`${this.url}/logout`);
        localStorage.removeItem('jwt');
        this.token.set(null);
        this.userSubject.next(null);
        this.router.navigate(['/login']);
    }

}
