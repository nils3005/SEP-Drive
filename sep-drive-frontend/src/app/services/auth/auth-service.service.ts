// src/app/services/auth.service.ts
import {inject, Injectable, signal} from '@angular/core';
import {BehaviorSubject, Observable, map, tap, catchError, throwError, switchMap} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {User} from "../../types";
import {Router} from "@angular/router";
import {UserService} from "../user/user.service";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User|null>(null);
  public user$: Observable<User|null> = this.userSubject.asObservable();
  private http = inject(HttpClient);
  private api: string = 'http://localhost:8080/auth';
  private userAPI: string = 'http://localhost:8080/users/username';
  private router: Router = inject(Router);
  private userService: UserService = inject(UserService);
  public token = signal<string | null>(localStorage.getItem('jwt'));
  /** Gibt true zurück, wenn userSubject aktuell einen Wert ≠ null hat */
  public isLoggedIn$: Observable<boolean> = this.user$.pipe(map(u => !!u));

    constructor() {
        // Wenn beim Start schon ein Token existiert, versuche den User zu laden
        const existingToken = this.token();
        if (existingToken) {
            const username = this.decodeUsernameFromToken(existingToken);
            if (username) {
                this.fetchUserByUsername(username)
                    .subscribe({
                        next: user => this.userSubject.next(user),
                        error: () => {
                            // Token ungültig oder User nicht gefunden => ausloggen
                            this.clearSession();
                        }
                    });
            } else {
                // Token-Format falsch => löschen
                this.clearSession();
            }
        }
    }

    private decodeUsernameFromToken(token: string): string | null {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub ?? null;
        } catch {
            return null;
        }
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
                    this.setSession(token, username);
                }),
                map(() => undefined)
            );
    }


    logout(): void {
        this.http.get<void>(`${this.api}/logout`);
        this.clearSession();
        this.router.navigate(['/login']);
    }

    private clearSession() {
        localStorage.removeItem('jwt');
        this.token.set(null);
        this.userSubject.next(null);
    }

    private setSession(token: string, username: string) {
        this.token.set(token);
        localStorage.setItem('jwt', token);
        this.fetchUserByUsername(username)
            .subscribe({
                next: user => {
                    this.userSubject.next(user);
                    this.router.navigate(['/']);
                },
                error: () => {
                    this.clearSession();
                }
            });
    }

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

    private fetchUserByUsername(username: string): Observable<User> {
        return this.http.get<User>(`${this.userAPI}/${username}`)
            .pipe(
                catchError((err: HttpErrorResponse) => {
                    return throwError(() => new Error('Fehler beim Laden des Users'));
                })
            );
    }

}
