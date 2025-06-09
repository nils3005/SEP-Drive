import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import {Client, Frame, IMessage} from "@stomp/stompjs";
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy {

  private client: Client;

  constructor() {
    // STOMP-Client konfigurieren
    this.client = new Client({
      // webSocketFactory verwendet SockJS, damit Spring-Boot automatisch SockJS "upgraden" kann
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20_000,
      debug: (str: string) => {
        // Debug-Log für STOMP (kann im Prod auskommentiert werden)
        console.debug('[STOMP]', str);
      }
    });

    // onConnect-Callback: hier kann man initial Subscriptions setzen, wenn nötig
    this.client.onConnect = (frame: Frame) => {
      console.log('STOMP verbunden:', frame.headers);
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
    return new Observable<T>((observer) => {
      // Sobald verbunden, subscriben
      const subscription = this.client.subscribe(topic, (message: IMessage) => {
        try {
          const payload = JSON.parse(message.body) as T;
          observer.next(payload);
        } catch (e) {
          observer.error(e);
        }
      });

      // Cleanup: beim Unsubscribe
      return () => {
        subscription.unsubscribe();
      };
    });
  }

  /**
   * Sendet eine Nachricht (JSON) an den STOMP-Endpunkt.
   *
   * @param destination z.B. "/app/send-offer"
   * @param body Beliebiges Objekt, das zu JSON serialisiert wird
   */
  public send(destination: string, body: any): void {
    if (this.client && this.client.active) {
      this.client.publish({
        destination,
        body: JSON.stringify(body)
      });
    } else {
      console.warn('STOMP-Client ist nicht aktiv. Nachricht nicht gesendet.');
    }
  }

  ngOnDestroy(): void {
    // Verbindungen sauber schließen
    if (this.client && this.client.active) {
      this.client.deactivate();
    }
  }
}
