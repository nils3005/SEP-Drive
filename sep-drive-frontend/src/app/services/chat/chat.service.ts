import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import { Observable } from 'rxjs';
import {Chat} from "../../types";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8080/chat';
  private http: HttpClient = inject(HttpClient);

  /**
   * Erstellt neuen Chat mit Customer
   */
  createChat(customerId: number, driverId: number): Observable<any> {
    const params = new HttpParams()
        .set('customerId', customerId + '')
        .set('driverId', driverId + '');
    return this.http.post(`${this.apiUrl}/create`, null, { params });
  }

  /**
   * Holt alle Chats für den User
   */
  getAllChats(): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${this.apiUrl}/all`);
  }

  /**
   * Holt einen einzelnen Chat per ID
   */
  getChat(chatId: number): Observable<Chat> {
    return this.http.get<Chat>(`${this.apiUrl}/${chatId}`);
  }

  /**
   * Holt den Chat für die angegebenen User (customerId & driverId)
   */
  getChatsByUsers(customerId: number, driverId: number): Observable<Chat> {
    const params = new HttpParams()
        .set('customerId', customerId)
        .set('driverId', driverId);

    return this.http.get<Chat>(`${this.apiUrl}/forusers`, { params });
  }

  /**
   * Sendet eine neue Nachricht in den Chat
   */
  sendMessage(chatId: number, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send/${chatId}`, { message });
  }

  /**
   * Löscht eine Nachricht
   */
  deleteMessage(chatId: number, messageId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteMessage/${chatId}/${messageId}`);
  }

  /**
   * Bearbeitet eine existierende Nachricht
   */
  editMessage(chatId: number, messageId: number, message: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/editMessage/${chatId}/${messageId}`, { message });
  }

  /**
   * Markiert Nachricht als gelesen
   */
  markAsRead(chatId: number, messageId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/markAsRead/${chatId}/${messageId}`, {});
  }

  /**
   * Löscht einen Chat
   */
  deleteChat(chatId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${chatId}`);
  }
}
