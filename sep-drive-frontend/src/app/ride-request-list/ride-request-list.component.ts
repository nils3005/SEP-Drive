import {AfterViewInit, Component, computed, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {RideRequestService} from '../services/riderequest/ride-request.service';
import {FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';
import {OpenRouteServiceService} from '../services/openroute/open-route-service.service';
import {ErrorService} from '../services/error/error.service';
import {GeocodeFeature, RideRequest, RideRequestSummary} from '../types';
import {BehaviorSubject} from 'rxjs';
import {MapService} from '../services/map/map.service';

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
export class RideRequestListComponent implements OnInit, AfterViewInit {
  // TODO: create RideOffer
  // TODO: keep track to accept only one
    // TODO: disable other buttons
    // TODO: cancel accept
  dataSource = new MatTableDataSource<RideTableRow>();
  displayedColumns: string[] = ['fahrtid', 'entfernung', 'zeitpunkt', 'klasse', 'name', 'bewertung', 'annehmen'];

  public accepted: boolean = false;
  public summaryData: RideRequestSummary | null = null;

  private currentPosition: BehaviorSubject<GeocodeFeature | null> = new BehaviorSubject<GeocodeFeature | null>(null);

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private rideRequestService: RideRequestService,
    private openRouteServiceService: OpenRouteServiceService,
    private errorService: ErrorService,
    private mapService: MapService,
  ) {
  }

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

  ngOnInit(): void {
    // Bestehender Code für RideRequests laden
    this.updateDistance()

    // Autocomplete für Start-Input
    this.routeForm.controls.start.valueChanges.subscribe(value => {
      if (value && !this.startSuppressAutocomplete) {
        this.openRouteServiceService.getAutocompleteSuggestions(value).subscribe((suggestions: { features: any[]; }) => {
          this.startSuggestions = suggestions.features.slice(0, 5);
          this.startShowSuggestions = true;
        });
      } else {
        this.startSuppressAutocomplete = false;
      }
    });
  }

  getAverageRating(ratings: number[]): number {
    if (ratings.length) {
      return 0;
    }
    const sum = ratings.reduce((acc, cur) => acc + cur, 0);
    return sum / ratings.length;
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
          const now = new Date();
          let position: [number, number];
          const currentPosition: GeocodeFeature | null = this.currentPosition.getValue();
          if (currentPosition) {
            position = currentPosition.geometry.coordinates;
          }
          this.dataSource.data = rideRequests.map(req => ({
            fahrtid: req.id.toString(),
            zeitpunkt: now,
            entfernung: position ? this.calculateDistanceKm(
              {lat: req.startLocation.latitude, lon: req.startLocation.longitude},
              {lat: position[1], lon: position[0]}
            ) : 0,
            klasse: req.carType,
            name: req.customer.username ?? 'Unbekannt',
            bewertung: this.getAverageRating(req.customer.ratings) ?? 0
          }));
        }
      }
    })
  }

  onStartBlur() {
    setTimeout(() => {
      this.startShowSuggestions = false;
    }, 100);
  }

  onStartFocus() {
    if (this.startSuggestions.length > 0) {
      this.startShowSuggestions = true;
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
          this.openRouteServiceService.getGeocodeFeatureByCoordinates(coords).subscribe({
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

  checkCoordinates() {
    const lat = this.routeForm.controls.startCordLat.value;
    const lon = this.routeForm.controls.startCordLon.value;
    if (lat && lon) {
      this.openRouteServiceService.getGeocodeFeatureByCoordinates({latitude: lat, longitude: lon}).subscribe({
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

  public createRideOffer(id: number): void
  {
    console.log("Create RideOffer")
    this.getSummary(id)
    this.accepted = true;
  }

  getSummary(id: number) {
    this.rideRequestService.getRideRequestById(id).subscribe({
      next: data => {
        if (data.body) {
          this.rideRequestService.getRideRequestSummaryFromRideRequest(data.body).then((response) => {
            this.summaryData = response;
            }
          );
        }
      }
    })
  }

  public minutesToHHMM(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60); // Ensure no fractions here
    return `${hours}:${mins.toString().padStart(2, '0')}`;
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

  getStarClass(rating: number, star: number): string {
    if (rating >= star) {
      return 'fas fa-star'; // voller Stern
    } else if (rating >= star - 0.5) {
      return 'fas fa-star-half-alt'; // halber Stern
    } else {
      return 'far fa-star'; // leerer Stern
    }
  }

  unAcceptRideRequest() {
    this.mapService.resetMap()
    // call to delete rideOffer
    this.accepted = false;
  }
}
