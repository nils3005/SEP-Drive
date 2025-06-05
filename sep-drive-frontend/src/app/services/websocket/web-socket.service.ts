import { Injectable } from '@angular/core';
import {WebSocketSubject} from 'rxjs/internal/observable/dom/WebSocketSubject';
import {Observable} from 'rxjs';
import {RideSettings} from '../../types';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private socket: WebSocketSubject<any>;

  constructor() {
    this.socket = new WebSocketSubject('http://localhost:8080/ws');
  }

  getMessages(): Observable<RideSettings> {
    return this.socket.asObservable();
  }

  closeConnection(): void {
    this.socket.complete();
  }
}
