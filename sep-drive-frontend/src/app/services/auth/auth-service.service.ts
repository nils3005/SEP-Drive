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
                        error: () => this.clearSession()            // Token ungültig oder User nicht gefunden => ausloggen
                    });
            } else {
                // Token-Format falsch => löschen
                this.clearSession();
            }
        }
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
                    this.setSession(token, username);
                }),
                map(() => undefined)
            );
    }

    /**
     * @brief Sendet die Logout Request an das Backend. Löscht den JWT aus dem localstorage und setzt
     * den eingeloggten user auf null. Navigiert abschließend zur Login Component.
     */
    logout(): void {
        this.http.post<void>(`${this.api}/logout`, null).subscribe();
        this.clearSession();
        this.router.navigate(['/login']);
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
     * @brief Hilfsfunktion, um den JWT beim Logout oder Fehlern aus dem localstorage zu löschen.
     */
    private clearSession() {
        localStorage.removeItem('jwt');
        this.token.set(null);
        this.userSubject.next(null);
    }

    /**
     * @brief Hilfsfunktion, um den JWT nach erfolgreicher Verifizierung im localstorage zu speichern.
     * Setzt den eingeloggten User mithilfe des UserServices und navigiert auf die Homepage. Löscht bei
     * einem Fehler den JWT.
     *
     * @param token - der JWT
     * @param username - der username des eingeloggten Users
     */
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

    /**
     * @brief Hilfsfunktion, die die User Entity aus dem Backend mithilfe des UserServices anfragt.
     * Wird im Konstruktor gebraucht, wenn der User aus dem localstorage geladen wird (JWT) und in
     * der verify Methode, wenn die Verifizierung erfolgreich ist.
     *
     * @param username - der username des (eingeloggten) Users
     *
     * @return den User, wenn er existiert, ansonsten den HTTP Error
     */
    private fetchUserByUsername(username: string): Observable<User> {
        return this.userService.getUserByUsername(username)
            .pipe(
                catchError((err: HttpErrorResponse) => {
                    return throwError(() => new Error('Fehler beim Laden des eingeloggten Users'));
                })
            );
    }

}
