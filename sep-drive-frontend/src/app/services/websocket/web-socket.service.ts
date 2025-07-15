import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage, Frame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy {

  private client: Client;
  public isConnected: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() {
    // STOMP-Client konfigurieren
    this.client = new Client({
      // webSocketFactory verwendet SockJS, damit Spring-Boot automatisch SockJS "upgraden" kann
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20_000,
      debug: (str) => {
        // Debug-Log für STOMP (kann im Prod auskommentiert werden)
        console.debug('[STOMP]', str);
      }
    });

    // onConnect-Callback: hier kann man initial Subscriptions setzen, wenn nötig
    this.client.onConnect = (frame: Frame) => {
      console.log('STOMP verbunden:', frame.headers);
      this.isConnected.next(true);
      // Beispiel: automatisch auf /topic/ride-offers subscriben
      // this.subscribe('/topic/ride-offers').subscribe(msg => console.log(msg));
    };

    this.client.onStompError = (frame: Frame) => {
      console.error('Broker-Fehler:', frame.headers['message']);
      console.error('Details:', frame.body);
    };

    // Client aktivieren (öffnet die Verbindung)
    this.client.activate();
  }

  /**
   * Abonniert einen bestimmten Topic-Kanal und liefert einen Observable-Stream
   * mit den eingehenden Nachrichten (als JSON geparst).
   *
   * @param topic z.B. "/topic/offers.123"
   */
  public subscribe<T>(topic: string): Observable<T> {
    return new Observable<T>(observer => {
      let stompSubscription: any;
      const connectSub = this.isConnected.subscribe(isConnected => {
        if (isConnected) {
          stompSubscription = this.client.subscribe(topic, (message: IMessage) => {
            try {
              observer.next(JSON.parse(message.body) as T);
            } catch (e) {
              observer.error(e);
            }
          });
        }
      });

      // Cleanup
      return () => {
        connectSub.unsubscribe();
        if (stompSubscription) stompSubscription.unsubscribe();
      };
    });
  }

  ngOnDestroy(): void {
    // Verbindungen sauber schließen
    if (this.client && this.client.active) {
      this.client.deactivate();
    }
  }
}

