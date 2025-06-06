import {Component, OnInit, OnDestroy, ViewChild, inject} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RideofferService } from '../../services/rideoffer/rideoffer.service';
import {RideOffer, RideOfferNotification} from '../../types';

import { MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import {WebsocketService} from "../../services/websocket/websocket.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {RideRequestSummaryComponent} from "../ride-request-summary/ride-request-summary.component";
import {MapComponent} from "../map/map.component";

@Component({
  selector: 'app-rideoffers',
  standalone: true,
  imports: [
    CommonModule,      // für ngIf, *ngFor, DecimalPipe, etc.
    DecimalPipe,       // für Formatierung in der Template (falls benötigt)
    MatTableModule,    // <table mat-table>
    MatSortModule,     // mat-sort-header, MatSort
    MatButtonModule,
    RideRequestSummaryComponent,
    MapComponent
  ],
  templateUrl: './ride-offers.component.html',
  styleUrls: ['./ride-offers.component.scss']
})
export class RideOffersComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private rideOfferService = inject(RideofferService);
  private webSocketService = inject(WebsocketService);
  private snackBar: MatSnackBar = inject(MatSnackBar);

  rideRequestId!: number;
  displayedColumns: string[] = [
    'driverName',
    'rating',
    'totalRides',
    'totalDistance',
    'price',
    'createdAt',
    'actions'
  ];
  dataSource = new MatTableDataSource<RideOffer>([]);

  @ViewChild(MatSort) sort!: MatSort;

  // Subscription für paramMap (wird in ngOnDestroy unsubscribet)
  private routeSub?: Subscription;

  ngOnInit(): void {
    // URL-Parameter auslesen (z.B. /ride-request/123/offers)
    this.routeSub = this.route.paramMap.subscribe(params => {
      this.rideRequestId = Number(params.get('rideRequestId'));
      this.loadOffers(); // erste Initialisierung
    });
  }

  ngOnDestroy(): void {
    // Bei Verlassen der Komponente Subscription abbrechen
    this.routeSub?.unsubscribe();
  }

  /**
   * Lädt die Angebote vom Server (Backend-Sortierung).
   *
   * @param sortBy Feld, nach dem sortiert wird (z.B. 'rating')
   * @param direction 'asc' | 'desc'
   */
  loadOffers(sortBy: string = 'rating', direction: string = 'desc'): void {
    this.rideOfferService.getOffersForRequest(this.rideRequestId, sortBy, direction)
        .subscribe({
          next: (offers: RideOffer[]) => {
            this.dataSource.data = offers;
          },
          error: (err) => {
            console.log('Fehler beim Laden der Angebote: ' +  err.message);
          }
        });
  }

  /**
   * Abonniert das STOMP-Topic "/topic/offers.{rideRequestId}", um
   * in Echtzeit informiert zu werden, sobald ein Fahrer ein neues Angebot sendet.
   */
  private subscribeToOfferNotifications(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }

    const topic = `/topic/offers.${this.rideRequestId}`;
    this.routeSub = this.webSocketService.subscribe<RideOfferNotification>(topic).subscribe({
      next: (notification) => {
        // Snackbar / Notification anzeigen
        this.snackBar.open(
            `Neues Angebot von ${notification.driverName} (${notification.driverRating.toFixed(1)} ★)`,
            'OK',
            { duration: 5000 }
        );
        // Tabelle neu laden
        this.loadOffers();
      },
      error: (err) => {
        console.error('WebSocket-Fehler:', err);
      }
    });
  }

  /**
   * Kunde nimmt Angebot an.
   */
  acceptOffer(offerId: number): void {
    if (confirm('Möchtest du dieses Angebot annehmen?')) {
      this.rideOfferService.acceptOffer(offerId).subscribe({
        next: () => {
          console.log('Angebot angenommen. Alle anderen Angebote wurden abgelehnt.'); // Debug
          this.snackBar.open('Angebot angenommen. Alle anderen Angebote wurden abgelehnt.', 'OK', { duration: 5000 });
          this.loadOffers();
        },
        error: (err) => {
          console.log('Fehler beim Annehmen: ' + err.message); // Debug
          this.snackBar.open(`Fehler: ${err.error.message}`, 'OK', { duration: 5000 });
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
          console.log('Angebot abgelehnt.');
          this.snackBar.open('Angebot abgelehnt.', 'OK', { duration: 3000 });
          this.loadOffers();
        },
        error: (err) => {
          console.log('Fehler beim Ablehnen: ' + err.message);
          this.snackBar.open(`Fehler: ${err.message}`, 'OK', { duration: 5000 });
        }
      });
    }
  }

  /**
   * Reagiert auf Sort-Änderungen in der UI.
   */
  onSortChange(sortState: Sort): void {
    if (!sortState.active || sortState.direction === '') {
      return;
    }
    this.loadOffers(sortState.active, sortState.direction);
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
