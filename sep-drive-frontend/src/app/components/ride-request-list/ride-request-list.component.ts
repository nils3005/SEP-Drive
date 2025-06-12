import {Component, inject, OnDestroy, OnInit, signal, ViewChild} from '@angular/core';
import {WebsocketService} from "../../services/websocket/websocket.service";
import {GeocodeFeature, RideOffer, RideOfferNotification, RideRequest, RideRequestSummary} from "../../types";
import {BehaviorSubject, Subscription} from "rxjs";
import {AuthService} from "../../services/auth/auth-service.service";
import {RideofferService} from "../../services/rideoffer/rideoffer.service";
import {CommonModule, DatePipe, NgForOf, NgIf} from "@angular/common";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable, MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {MatSort, MatSortHeader, MatSortModule} from "@angular/material/sort";
import {RideRequestService} from "../../services/riderequest/ride-request.service";
import {OpenRouteServiceService} from "../../services/openroute/open-route-service.service";
import {ErrorService} from "../../services/error/error.service";
import {MapService} from "../../services/map/map.service";
import {UserService} from "../../services/user/user.service";

export interface RideTableRow {
  fahrtid: string;
  zeitpunkt: Date;
  entfernung: number;
  klasse: string;
  name: string;       // Name des Fahrgasts
  bewertung: number;     // Bewertung (numerisch)
}

@Component({
  selector: 'app-ride-request-list',
  standalone: true,
  templateUrl: './ride-request-list.component.html',
  styleUrl: './ride-request-list.component.scss',
  imports: [FormsModule, CommonModule, MatTableModule, MatSortModule, ReactiveFormsModule]
})
export class RideRequestListComponent implements OnInit, OnDestroy {
  private rideOfferService: RideofferService = inject(RideofferService);
  private rideRequestService: RideRequestService = inject(RideRequestService);
  private openRouteService: OpenRouteServiceService = inject(OpenRouteServiceService);
  private errorService: ErrorService = inject(ErrorService);
  private mapService: MapService = inject(MapService);
  private userService: UserService = inject(UserService);

  private webSocketService: WebsocketService = inject(WebsocketService);
  private authService: AuthService = inject(AuthService);
  private sub?: Subscription;

  // TODO: create RideOffer
  // TODO: cancel RideOffer
  dataSource = new MatTableDataSource<RideTableRow>();
  displayedColumns: string[] = ['fahrtid', 'entfernung', 'zeitpunkt', 'klasse', 'name', 'bewertung', 'annehmen'];

  public accepted: boolean = false;
  public selectedRideRequestId = signal(-1);
  public summaryData: RideRequestSummary | null = null;

  private currentPosition: BehaviorSubject<GeocodeFeature | null> = new BehaviorSubject<GeocodeFeature | null>(null);

  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  // route-input
  public routeForm = new FormGroup({
    start: new FormControl(''),
    startCordLat: new FormControl(''),
    startCordLon: new FormControl(''),
  });

  public startSuggestions: any[] = []; // Typ ggf. anpassen, z.B. GeocodeFeature[]
  public startShowSuggestions = false;
  public startSuppressAutocomplete = false;
  public useStartCoordinates = false;

  ngOnInit() {
    // Bestehender Code für RideRequests laden
    this.updateDistance()

    // Autocomplete für Start-Input
    this.routeForm.controls.start.valueChanges.subscribe(value => {
      if (value && !this.startSuppressAutocomplete) {
        this.openRouteService.getAutocompleteSuggestions(value).subscribe((suggestions: { features: any[]; }) => {
          this.startSuggestions = suggestions.features.slice(0, 5);
          this.startShowSuggestions = true;
        });
      } else {
        this.startSuppressAutocomplete = false;
      }
    });
  }



  /**
   * @brief Wenn der Driver ein Angebot für eine Anfrage erstellt, subscribed er dem Topic, um zu erfahren,
   * ob er
   *
   * @param rideRequestId
   */
  createRideOffer(rideRequestId: number): void {
    // TODO Button für entsprechende Zeile wird zu Abbrechen-Button, alle anderen Buttons verschwinden
    this.rideOfferService.createOffer(rideRequestId).subscribe({
      next: (rideOffer: RideOffer) => {
        this.selectedRideRequestId.set(rideRequestId);
        this.subscribeToTopic(rideRequestId);
      },
      error: err => {
        console.log(err);
      }
    });
  }

  withdrawRideOffer(rideRequestId: number): void {
    this.mapService.resetMap()
    this.rideOfferService.withdrawOfferForRideRequest(rideRequestId).subscribe({
      next: _ => {
        // TODO Fahrer darstellen, dass er wieder neue Angebote machen kann
        this.selectedRideRequestId.set(-1);
      },
      error: err => {
        console.log(err);
      }
    });
    this.accepted = false;
  }

  subscribeToTopic(rideRequestId: number) {
    // TODO was wenn Driver Seite neu lädt => Dann ist Topic nicht mehr subscribed, aber die Offer noch gültig => Fahrer würde nicht informiert werden
    this.sub = this.webSocketService
        .subscribe<RideOfferNotification>(`/topic/ride-requests/${rideRequestId}/offers`)
        .subscribe({
          next: (notification) => {
            if (notification.description === "ACCEPTED_OFFER") {
              if (notification.driverId === this.authService.user()!.id) {
                // TODO Das passiert für den Driver, dessen Offer akzeptiert wurde
              } else {
                // TODO Das passiert für alle anderen Driver
              }
            }
          },
          error: (err) => {
            console.error("WebSocket Fehler:", err);
          }
        });
  }

  ngOnDestroy(): void {
    // Bei Verlassen der Komponente Subscription abbrechen
    this.sub?.unsubscribe();
  }

  getStarClass(rating: number, star: number): string {
    if (rating >= star) {
      return 'fas fa-star'; // voller Stern
    } else if (rating >= star - 0.5) {
      return 'fas fa-star-half-alt'; // halber Stern
    } else {
      return 'far fa-star'; // leerer Stern
    }
  }

  private calculateDistanceKm(start: { lon: number | string; lat: number | string }, end: {
    lon: number | string;
    lat: number | string
  }): number {
    // @ts-ignore
    const toRad = (value: number | string) => value * Math.PI / 180;
    const R = 6371;
    // @ts-ignore
    const dLat = toRad(end.lat - start.lat);
    // @ts-ignore
    const dLon = toRad(end.lon - start.lon);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(start.lat)) * Math.cos(toRad(end.lat)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100; // auf 2 Nachkommastellen runden
  }

  public minutesToHHMM(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60); // Ensure no fractions here
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  }

  checkCoordinates() {
    const lat = this.routeForm.controls.startCordLat.value;
    const lon = this.routeForm.controls.startCordLon.value;
    if (lat && lon) {
      this.openRouteService.getGeocodeFeatureByCoordinates({latitude: lat, longitude: lon}).subscribe({
        next: (response: any) => {
          if (response.body) {
            this.currentPosition.next(response.body.features[0]);
            // this.geoService.currentPoint.next(response.body.features[0]);
          }
        },
        error: () => this.errorService.showError('Position konnte nicht gefunden werden'),
      });
    } else {
      this.errorService.showError('Alle Felder müssen ausgefüllt sein');
    }
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            this.openRouteService.getGeocodeFeatureByCoordinates(coords).subscribe({
              next: (response) => {
                if (response.body) {
                  this.onStartSelect(response.body.features[0]);
                }
              },
              error: () => this.errorService.showError('Position konnte nicht gefunden werden'),
            });
          },
          (error) => {
            // Fehlerbehandlung (kann noch erweitert werden)
            this.errorService.showError('Standort konnte nicht ermittelt werden.');
          },
          {enableHighAccuracy: true, timeout: 10000, maximumAge: 0}
      );
    } else {
      this.errorService.showError('Geolocation wird von diesem Browser nicht unterstützt.');
    }
  }

  onStartFocus() {
    if (this.startSuggestions.length > 0) {
      this.startShowSuggestions = true;
    }
  }

  onStartBlur() {
    setTimeout(() => {
      this.startShowSuggestions = false;
    }, 100);
  }

  onStartSelect(suggestion: GeocodeFeature) {
    // this.geoService.updateStart(suggestion);
    this.currentPosition.next(suggestion);
    this.updateDistance()
    this.startSuppressAutocomplete = true;
    this.routeForm.controls.start.setValue(suggestion.properties.label);
    this.startSuggestions = [];
    this.startShowSuggestions = false;
  }

  updateDistance(): void
  {
    this.rideRequestService.getAllRideRequests().subscribe({
      next: data => {
        if (data.body) {
          let rideRequests: RideRequest[] = data.body;
          let position: [number, number];
          const currentPosition: GeocodeFeature | null = this.currentPosition.getValue();
          if (currentPosition) {
            position = currentPosition.geometry.coordinates;
          }
          this.dataSource.data = rideRequests.map(req => ({
            fahrtid: req.id.toString(),
            zeitpunkt: new Date(req.createdAt),
            entfernung: position ? this.calculateDistanceKm(
                {lat: req.startLocation.latitude, lon: req.startLocation.longitude},
                {lat: position[1], lon: position[0]}
            ) : 0,
            klasse: req.carType,
            name: req.username ?? 'Unbekannt',
            bewertung: req.userRating ?? 0
          }));
        }
      }
    })
  }

}


