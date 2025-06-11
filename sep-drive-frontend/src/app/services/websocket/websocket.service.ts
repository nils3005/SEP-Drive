import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import {Client, Frame, IMessage, StompSubscription} from "@stomp/stompjs";
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy {

  private client: Client;
  private pendingSubscriptions: {
    topic: string;
    observer: any;
  }[] = [];

  constructor() {
    // STOMP-Client konfigurieren
    this.client = new Client({
      // webSocketFactory verwendet SockJS, damit Spring-Boot automatisch SockJS "upgraden" kann
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20_000,
      //debug: (str: string) => { console.debug('[STOMP]', str) }
    });

    // onConnect-Callback: hier kann man initial Subscriptions setzen, wenn nötig
    this.client.onConnect = (frame: Frame) => {
      console.log('STOMP verbunden:', frame.headers);
      this.pendingSubscriptions.forEach(ps => this._doSubscribe(ps.topic, ps.observer));
      this.pendingSubscriptions = [];
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
      if (this.client.connected) {
        const sub = this._doSubscribe(topic, observer);
        return () => sub.unsubscribe();
      }
      // sonst merke Dir Topic und Observer und subscribe später
      this.pendingSubscriptions.push({ topic, observer });
      // Cleanup: entferne aus pending und unsubscriben falls schon da
      return () => {
        // Entferne aus noch nicht ausgeführten Subscriptions
        this.pendingSubscriptions = this.pendingSubscriptions.filter(
            ps => !(ps.topic === topic && ps.observer === observer)
        );
      };
    });
  }

  /** Internes: führt das echte STOMP subscribe aus */
  private _doSubscribe<T>(topic: string, observer: any): StompSubscription {
    const sub = this.client.subscribe(topic, (msg: IMessage) => {
      try {
        observer.next(JSON.parse(msg.body) as T);
      } catch (e) {
        observer.error(e);
      }
    });
    // wenn der Observer unsubscribet, wird automatisch sub.unsubscribe() aufgerufen
    return sub;
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
