import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable, of} from "rxjs";
import {User} from "../../models/User";

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  private loggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private http = inject(HttpClient);
  private url: string = 'http://localhost:8080/users'; // TODO ändern für docker?

  // TODO Testdaten für User - löschen sobald UserController gemerged ist
  private testUsers: User[] = [
    {
      id: 1, username: 'hans_kunz', role: 'Fahrer',
      firstName: 'Hans', lastName: 'Kunz',
      email: 'hans-kunz@gmail.com', birthDate: '2025-01-01',
      totalRides: 120, ratings: [4, 3 ,5], carType: 'Van'
    }
  ];

  getUsers(): Observable<User[]> {
    //return this.http.get<User[]>(this.url);

    // Nur zum Testen
    return of(this.testUsers)
  }

  getUserById(id: number): Observable<User | undefined> {
    //return this.http.get<User>(this.url + '/' + id);

    // Nur zum Testen
    const user = this.testUsers.find(u => u.id === id);
    return of(user);
  }

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
