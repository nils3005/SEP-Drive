// src/app/services/auth.service.ts
import {inject, Injectable, signal} from '@angular/core';
import {BehaviorSubject, Observable, map, tap, catchError, throwError, switchMap} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {User} from "../../types";
import {Router} from "@angular/router";
import {UserServiceService} from "../user/user-service.service";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User|null>(null);
  public user$: Observable<User|null> = this.userSubject.asObservable();
  private http = inject(HttpClient);
  private api: string = 'http://localhost:8080/auth';
  private userAPI: string = 'http://localhost:8080/users/username';
  private router: Router = inject(Router);
  private userService: UserServiceService = inject(UserServiceService);
  public token = signal<string | null>(localStorage.getItem('jwt'));
  /** Gibt true zurück, wenn userSubject aktuell einen Wert ≠ null hat */
  public isLoggedIn$: Observable<boolean> = this.user$.pipe(map(u => !!u));

    checkUsername(username: string): Observable<void> {
        return this.http
            .post<string>(
                `${this.api}/checkUsername`,
                { username, password: ''},
                { responseType: 'text' as 'json' }
            )
            // Mappe den Text auf void, damit Login Observable<void> bekommt
            .pipe(
                map(() => {
                    // Wir werfen das Textergebnis weg
                })
            );
    }

    login(credentials: { username: string; password: string }): Observable<string> {
        return this.http
            .post(
                `${this.api}/login`,
                credentials,
                { responseType: 'text' }
            )
            .pipe(
                catchError((err: HttpErrorResponse) => {
                    const msg = err.status === 401
                        ? 'Ungültige Zugangsdaten.'
                        : 'Login fehlgeschlagen.';
                    return throwError(() => new Error(msg));
                })
            );
    }

    verify(username: string, code: string): Observable<void> {
        return this.http
            .post(
                `${this.api}/verify`,
                { username, code },
                { responseType: 'text' }
            )
            .pipe(
                catchError((err: HttpErrorResponse) => {
                    const msg = err.status === 400
                        ? 'Ungültiger Verifizierungscode.'
                        : 'Verifizierung fehlgeschlagen.';
                    return throwError(() => new Error(msg));
                }),
                tap(token => {
                    this.token.set(token);
                    localStorage.setItem('jwt', token);
                }),
                switchMap(() => this.fetchUserByUsername(username)),
                tap(user => {
                    this.userSubject.next(user);
                    this.router.navigate(['/']);
                }),
                map(() => undefined)
            );
    }

    logout(): void {
        this.http.get<void>(`${this.api}/logout`);
        localStorage.removeItem('jwt');
        this.token.set(null);
        this.userSubject.next(null);
        this.router.navigate(['/login']);
    }

    private fetchUserByUsername(username: string): Observable<User> {
        return this.http.get<User>(`${this.userAPI}/${username}`)
            .pipe(
                catchError((err: HttpErrorResponse) => {
                    return throwError(() => new Error('Fehler beim Laden des Users'));
                })
            );
    }

}
