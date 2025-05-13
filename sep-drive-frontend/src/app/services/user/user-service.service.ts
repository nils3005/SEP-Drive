import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  private loggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private http = inject(HttpClient);

  constructor() { }

  getUserStatus():Observable<boolean> {
    return this.loggedInSubject.asObservable();
  }

  login(): void {
    // Logik zum Anmelden
    this.loggedInSubject.next(true);
  }

  logout(): void {
    // Logik zum Abmelden
    this.loggedInSubject.next(false);
  }
}
