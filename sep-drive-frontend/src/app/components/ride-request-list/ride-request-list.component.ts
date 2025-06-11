import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {WebsocketService} from "../../services/websocket/websocket.service";
import {RideOffer, RideOfferNotification} from "../../types";
import {Subscription} from "rxjs";
import {AuthService} from "../../services/auth/auth-service.service";
import {RideofferService} from "../../services/rideoffer/rideoffer.service";

@Component({
  selector: 'app-ride-request-list',
  imports: [],
  templateUrl: './ride-request-list.component.html',
  styleUrl: './ride-request-list.component.scss'
})
export class RideRequestListComponent implements OnDestroy {
  private rideOfferService: RideofferService = inject(RideofferService);
  private webSocketService: WebsocketService = inject(WebsocketService);
  private authService: AuthService = inject(AuthService);
  private sub?: Subscription;

  ngOnDestroy(): void {
    // Bei Verlassen der Komponente Subscription abbrechen
    this.sub?.unsubscribe();
  }

  /**
   * @brief Wenn der Driver ein Angebot für eine Anfrage erstellt, subscribed er dem Topic, um zu erfahren,
   * ob er
   *
   * @param rideRequestId
   */
  createOffer(rideRequestId: number): void {
    this.rideOfferService.createOffer(rideRequestId).subscribe({
      next: (rideOffer: RideOffer) => {
        // TODO Fahrer irgendwie informieren - alle anderen offers ausgrauen oder was auch immer
      },
      error: err => {
            console.log(err);
      }
    }

    );

    // TODO was wenn Driver Seite neu lädt => Dann ist Topic nicht mehr subscribed, aber die Offer noch gültig => Fahrer würde nicht informiert werden
    this.sub = this.webSocketService
        .subscribe<RideOfferNotification>(`/topic/ride-requests/${rideRequestId}/offers`)
        .subscribe({
          next: (notification) => {
            if (notification.description === "ACCEPTED_OFFER") {
              if (notification.driverId === this.authService.user()!.id) {
                // Das passiert für den Driver, dessen Offer akzeptiert wurde
              } else {
                // Das passiert für alle anderen Driver
              }
            }
          },
          error: (err) => {
            console.error("WebSocket Fehler:", err);
          }
        });
  }

  withdrawOffer(rideRequestId: number): void {
    this.rideOfferService.withdrawOffer(rideRequestId).subscribe({
      next: _ => {
        // TODO Fahrer darstellen, dass er wieder neue Angebote machen kann
      },
      error: err => {
        console.log(err);
      }
    })
  }
}


