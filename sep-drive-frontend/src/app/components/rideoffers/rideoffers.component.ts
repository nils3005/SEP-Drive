import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RideofferService } from '../../services/rideoffer/rideoffer.service';
import { RideOffer } from '../../types';

import { MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rideoffers',
  standalone: true,
  imports: [
    CommonModule,      // für ngIf, *ngFor, DecimalPipe, etc.
    DecimalPipe,       // für Formatierung in der Template (falls benötigt)
    MatTableModule,    // <table mat-table>
    MatSortModule,     // mat-sort-header, MatSort
    MatButtonModule    // <button mat-button>
  ],
  templateUrl: './rideoffers.component.html',
  styleUrls: ['./rideoffers.component.scss']
})
export class RideoffersComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private rideOfferService = inject(RideofferService);

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

  ngAfterViewInit(): void {
    // Sobald MatSort verfügbar ist, zuweisen
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
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
            alert('Fehler beim Laden der Angebote: ' +  err.message);
          }
        });
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
   * Kunde nimmt Angebot an.
   */
  acceptOffer(offerId: number): void {
    if (confirm('Möchtest du dieses Angebot annehmen?')) {
      this.rideOfferService.acceptOffer(offerId).subscribe({
        next: () => {
          alert('Angebot angenommen. Alle anderen Angebote wurden abgelehnt.');
          this.loadOffers();
        },
        error: (err) => {
          alert('Fehler beim Annehmen: ' + err.message);
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
          alert('Angebot abgelehnt.');
          this.loadOffers();
        },
        error: (err) => {
          alert('Fehler beim Ablehnen: ' + err.message);
        }
      });
    }
  }
}
