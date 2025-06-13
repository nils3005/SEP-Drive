import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "../../types";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private url: string = 'http://localhost:8080/users';

  /**
   * @brief Ruft alle User vom Backend ab.
   *
   * @returns {Observable<User[]>} Ein Observable, das ein Array aller User zurückgibt.
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.url);
  }

  /**
   * @brief Ruft einen einzelnen User anhand seiner ID vom Backend ab.
   *
   * @param id - Die Id des Users.
   * @returns {Observable<User>} Ein Observable mit dem User.
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(this.url + '/' + id);
  }

  /**
   * Ruft einen einzelnen User anhand seines Benutzernamens vom Backend ab.
   *
   * @param name - Der Benutzername, nach dem gesucht werden soll.
   * @returns {Observable<User>} Ein Observable mit dem User.
   */
  getUserByUsername(name: string) {
    return this.http.get<User>(this.url + '/username/' + name);
  }

  addCreditCard(data: {
    cardNumber: string;
    expiryDate: number;
    cvc: string;
  }): Observable<string> {
    return this.http.post('http://localhost:8080/money/addcreditcard', data, {
      responseType: 'text'
    });
  }

  addBankAccount(data: {
    iban: string;
  }): Observable<string> {
    return this.http.post('http://localhost:8080/money/addbankaccount', data, {
      responseType: 'text'
    });
  }

  deposit(amount: number): Observable<string> {
    return this.http.post(`http://localhost:8080/money/deposit/${amount}`, null, {
      responseType: 'text'
    });
  }

  disburse(amount: number): Observable<string> {
    return this.http.post(`http://localhost:8080/money/disburse/${amount}`, null, {
      responseType: 'text'
    });
  }




}
