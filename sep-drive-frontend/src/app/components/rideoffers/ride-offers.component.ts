import {Component, OnInit, OnDestroy, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RideofferService } from '../../services/rideoffer/rideoffer.service';
import {GeoJsonRoute, RideDto, RideOffer, RideOfferNotification} from '../../types';

import {WebsocketService} from "../../services/websocket/websocket.service";
import {RideRequestService} from "../../services/riderequest/ride-request.service";
import {Subscription} from "rxjs";
import { Router } from '@angular/router';
import {GeoService} from '../../services/geo/geo.service';
import {RideService} from '../../services/ride/ride.service';
import {RideSimulationStore} from '../../stores/rideSimulation/ride-simulation-store.service';
import {AuthService} from '../../services/auth/auth-service.service';
import {ErrorService} from '../../services/error/error.service';
import {ChatComponent} from "../chat/chat.component";
import {GeoStoreService} from '../../stores/geo/geo-store.service';

@Component({
  selector: 'app-rideoffers',
  standalone: true,
  imports: [
    CommonModule,
    ChatComponent
  ],
  templateUrl: './ride-offers.component.html',
  styleUrls: ['./ride-offers.component.scss']
})
export class RideOffersComponent implements OnInit, OnDestroy {
  private rideOfferService = inject(RideofferService);
  private webSocketService = inject(WebsocketService);
  private rideRequestService: RideRequestService = inject(RideRequestService);
  private geoService = inject(GeoService);
  private rideService: RideService = inject(RideService);
  private geoStoreService: GeoStoreService = inject(GeoStoreService);

  /** Aktuelle Liste, vom Websocket-Stream befüllt */
  offers = signal<RideOffer[]>([]);

  /** Aktueller Sort-State */
  private currentSort: SortParams = { field: 'rating', direction: 'desc' };

  // Signal für Banner-Anzeige
  notification = signal("");
  lastClickedRideOfferId = signal<number | null>(null);

  private rideOfferNotification: RideOfferNotification | null = null;

  private rideRequestId: number = -1;

  // Subscription für paramMap (wird in ngOnDestroy unsubscribet)
  private sub?: Subscription;

  private router: Router = inject(Router);
  public isListVisible = signal(true);

  ngOnInit(): void {
    // active RideRequest holen
    this.rideRequestService.getActiveRideRequest().subscribe({
      next: ({ body }) => {
        this.rideRequestId = body.id;

        // Initial per HTTP laden
        this.loadOffers();

        // Erst jetzt auf den richtigen Topic subscriben
        this.sub = this.webSocketService
            .subscribe<RideOfferNotification>(`/topic/ride-requests/${this.rideRequestId}/offers`)
            .subscribe({
              next: (notification) => {
                this.loadOffers(); // Das löst den HTTP-Call aus
                this.rideOfferNotification = notification;
                if (notification.description === "NEW_OFFER") {
                  this.notification.set("Du hast ein neues Fahrangebot von " +  notification.driverName + " erhalten.");
                } else if(notification.description === "WITHDRAWN_OFFER") {
                  this.notification.set("Das Fahrangebot von " +  notification.driverName + " wurde zurückgezogen.");
                }
                setTimeout(() => this.notification.set(""), 8000);
              },
              error: (err) => {
                console.error("WebSocket Fehler:", err);
              }
            });
      },
      error: err => {
        console.error('Fehler beim Laden der RideRequest:', err);
      }
    });
  }

  ngOnDestroy(): void {
    // Bei Verlassen der Komponente Subscription abbrechen
    this.sub?.unsubscribe();
  }

  private loadOffers() {
    this.rideOfferService
        .getOffersForRequest(
            this.rideRequestId,
            this.currentSort.field,
            this.currentSort.direction
        )
        .subscribe({
          next: (list) => {
            this.offers.set(list);
          },
          error: (err) => {
            console.error("Fehler beim Laden der Offers:", err);
          }
        });
  }

  /**
   * Gibt die FontAwesome-Klassen zurück für:
   *  - fa-sort        (unsortiert)
   *  - fa-sort-up     (aufsteigend)
   *  - fa-sort-down   (absteigend)
   */
  arrow(field: string): string {
    if (this.currentSort.field !== field) {
      return 'fas fa-sort';
    }
    return this.currentSort.direction === 'asc'
        ? 'fas fa-sort-up'
        : 'fas fa-sort-down';
  }

  sortBy(field: SortParams['field']) {
    const dir: SortParams['direction'] =
        this.currentSort.field === field
            ? (this.currentSort.direction === 'asc' ? 'desc' : 'asc')
            : 'desc';

    this.currentSort = { field, direction: dir };
    this.loadOffers();
  }

  /**
   * Kunde nimmt Angebot an.
   */
  acceptOffer(offerId: number): void {
    if (confirm('Möchtest du dieses Angebot annehmen?')) {
      this.rideOfferService.acceptOffer(offerId).subscribe({
        next: (rideOffer) => {
          const route: GeoJsonRoute = this.geoStoreService.route.getValue()

          this.rideRequestService.getRideRequestById(rideOffer.rideRequestId).subscribe({
            next: (rideRequest) => {
              if (rideRequest.body) {
                let rideDto: RideDto = {
                  driverId: rideOffer.driverId,
                  customerId: rideOffer.customerId,
                  speed: 15,
                  duration: route.features[0].properties.summary.duration,
                  distance: route.features[0].properties.summary.distance,
                  geoJson: JSON.stringify(route),
                  startLocation: rideRequest.body?.startLocation,
                  destination: rideRequest.body.destination,
                  waypoints: rideRequest.body.waypoints,
                };
                console.log("customerId from acceptOffer: ", rideDto.customerId);
                console.log("driverid from acceptOffer: ", rideDto.driverId);

                const carType = this.geoStoreService.carType.getValue();
                console.log(carType);

                this.rideService.createRide(rideDto);
                console.log("Created ride")
                this.router.navigate(['/simulation']);

                this.loadOffers();
              }
            }
          })


        },
        error: (err) => {
          console.log('Fehler beim Annehmen: ' + err.message);
        }
      });
    }
  }

  /**
   * Kunde lehnt Angebot ab.
   */
  rejectOffer(offerId: number): void {
    if (confirm('Möchtest du dieses Angebot ablehnen?')) {
      this.rideOfferService.rejectOffer(offerId).subscribe({
        next: () => {
          this.loadOffers();
        },
        error: (err) => {
          console.log('Fehler beim Ablehnen: ' + err.message);
        }
      });
    }
  }

  showChat(rideOfferId: number): void {
    this.isListVisible.set(false);
    this.lastClickedRideOfferId.set(rideOfferId);

  }

  closeChat(): void {
    this.isListVisible.set(true);
    this.lastClickedRideOfferId.set(null);
  }

  /**
   * @brief Gibt die CSS Klasse für den entsprechenden Durchschnitt zurück.
   *
   * @param rating - der Durchschnitt aller Ratings.
   * @param star - der Index des Sterns, dem eine CSS Klasse zugeordnet werden soll.
   *
   * @return die CSS Klasse von Fontawesome.
   */
  averageClass(star: number, rating: number): string {
    if (rating >= star) {
      return 'fas fa-star';                 // voller Stern
    } else if (rating >= star - 0.5) {
      return 'fas fa-star-half-alt';        // halber Stern
    } else {
      return 'far fa-star';                 // leerer Stern
    }
  }
}

export interface SortParams {
  field: 'rating' | 'totalRides' | 'distance';
  direction: 'asc' | 'desc';
}
