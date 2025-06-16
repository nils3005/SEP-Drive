import {computed, effect, inject, Injectable, signal} from '@angular/core';
import {Observable , map, tap, catchError, throwError} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {User} from "../../types";
import {Router} from "@angular/router";
import {UserService} from "../user/user.service";

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private router: Router = inject(Router);
    private userService: UserService = inject(UserService);
    private api: string = 'http://localhost:8080/auth';

    token = signal<string|null>(localStorage.getItem('jwt'));
    user = signal<User|null>(null);
    // Gibt true zurück, wenn ein user eingeloggt ist, sonst false
    isLoggedIn = computed(() => !!this.user());

    constructor() {
        // Synchronisiere localStorage auf jede token-Änderung
        effect(() => {
            const t = this.token();
            if (t) {
                localStorage.setItem('jwt', t);
                const name = this.decodeUsernameFromToken(t);
                if (name) {
                    this.userService.getUserByUsername(name)
                        .pipe(catchError(() => {
                            this.clearSession();
                            return throwError(() => new Error());
                        }))
                        .subscribe(u => this.user.set(u));
                } else {
                    this.clearSession();
                }
            } else {
                localStorage.removeItem('jwt');
                this.user.set(null);
            }
        });
    }

    updateUserData(): void
    {
        const jwt = localStorage.getItem('jwt');
        if (jwt) {
          const name = this.decodeUsernameFromToken(jwt);
          if (name) {
            this.userService.getUserByUsername(name)
              .pipe(catchError(() => {
                this.clearSession();
                return throwError(() => new Error());
              }))
              .subscribe(u => this.user.set(u));
          }
        }
    }

    /**
     * @brief Sendet eine Login Request mit username und password an das Backend.
     *
     * @param credentials - enthält username und password.
     *
     * @return Text, ob login erfolgreich oder nicht.
     */
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

    /**
     * @brief Sendet eine Verify Request an das Backend mit username und code. Speichert den JWT bei
     * erfolgreicher Verifizierung im localstorage des Browsers.
     *
     * @param username - der username
     * @param code - der Verifizierungscode
     *
     * @return Completion-Signal bzw. Error-Signal
     */
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
                    // Token ins Signal und localStorage
                    this.token.set(token);
                    localStorage.setItem('jwt', token);
                    // User laden und Navigation
                    this.userService.getUserByUsername(username).subscribe({
                        next: user => {
                            this.user.set(user);
                            this.router.navigate(['/']);
                        },
                        error: () => this.clearSession()
                    });
                }),
                map(() => undefined)
            );
    }

    /**
     * @brief Sendet die Logout Request an das Backend. Löscht den JWT aus dem localstorage und setzt
     * den eingeloggten user auf null. Navigiert abschließend zur Login Component.
     */
    logout(): void {
        this.http.post(`${this.api}/logout`, null, {responseType: 'text'}).subscribe();
        this.clearSession();
        this.router.navigate(['/login']);
    }

    /**
     * @brief Sendet eine Register Request an den AuthController.
     *
     * @param username
     * @param firstName
     * @param lastName
     * @param email
     * @param rolle
     * @param password
     * @param birthDate
     * @param profilePicture
     * @param carType
     *
     * @return Observable
     */
    register(username: string, firstName: string, lastName: string, email: string,
             rolle: string, password: string, birthDate: string, profilePicture: string,
             carType: string): Observable<string> {
        return this.http.post(`${this.api}/register`,
            {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                username: username,
                birthDate: birthDate,
                profilePicture: profilePicture,
                carType: carType,
                role: rolle
            },
            {
                responseType: 'text'
            }
        )
    }

    /**
     * @brief Sendet eine Request an den AuthController, um zu prüfen, ob der username existiert.
     *
     * @param username - der username des eingeloggten Users
     *
     * @return Nur Completion-Signal bzw. Error-Signal
     */
    checkUsername(username: string): Observable<void> {
        return this.http
            .post<string>(
                `${this.api}/checkUsername`,
                { username, password: ''},
                { responseType: 'text' as 'json' }
            )
            // Mappe den Text auf void, damit Login Observable<void> bekommt
            .pipe(
                map(() => {}) // Wir werfen das Textergebnis weg - brauchen wir nicht im Login
            );
    }

    /**
     * @brief Hilfsfunktion, um den username aus dem JWT zu extrahieren.
     *
     * @param token - Der JWT aus dem localStorage.
     *
     * @return username aus dem JWT, wenn vorhanden, sonst null.
     */
    private decodeUsernameFromToken(token: string): string | null {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub ?? null;
        } catch {
            return null;
        }
    }

    /**
     * @brief Hilfsfunktion, um den JWT beim Logout oder Fehlern aus dem localstorage zu löschen.
     */
    private clearSession() {
        localStorage.removeItem('jwt');
        this.token.set(null);
        this.user.set(null);
    }

}
