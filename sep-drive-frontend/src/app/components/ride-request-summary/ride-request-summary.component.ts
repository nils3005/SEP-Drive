import {Component, Input} from '@angular/core';
import {Ride, RideRequestSummary} from '../../types';
import {MapService} from '../../services/map/map.service';
import {RideRequestService} from '../../services/riderequest/ride-request.service';
import {GeoService} from '../../services/geo/geo.service';
import {CarType} from '../../enums/car-type';
import {ErrorService} from "../../services/error/error.service";
import {Router} from "@angular/router";
import {BehaviorSubject} from "rxjs";
import {Util} from "leaflet";
import {RideSimulationStore} from '../../stores/rideSimulation/ride-simulation-store.service';
import {AuthService} from '../../services/auth/auth-service.service';

@Component({
  selector: 'app-ride-request-summary',
  imports: [],
  templateUrl: './ride-request-summary.component.html',
  styleUrl: './ride-request-summary.component.scss'
})
export class RideRequestSummaryComponent {

  summaryData: RideRequestSummary | null = null;

  constructor(
      private mapService: MapService,
      private rideRequestService: RideRequestService,
      public geoService: GeoService,
      private errorService: ErrorService,
      private router: Router,
      private rideSimulationStore: RideSimulationStore,
      private authService: AuthService
  ) {
    rideRequestService.getRideRequestSummary().then((data) => {
      if (data == null) {
        geoService.showInput.next(false);
      } else {
        this.summaryData = data;
        this.rideSimulationStore.ridePrice.next(this.summaryData.price)
      }
    });
    this.checkChanges();
  }

  private checkChanges(): void {
    this.geoService.rideRequestSummaryData.asObservable().subscribe(data => {
      if (data) {
        this.summaryData = data;
      }
    })
  }

  public minutesToHHMM(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60); // Ensure no fractions here
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  }

  onSubmit() {
    const carType = this.geoService.carType.getValue();
    if (this.geoService.waypoints.getValue().length > 1 && carType) {
      if (this.summaryData && this.authService.user()!.financials?.balance >= this.summaryData?.price) {
        this.rideRequestService.requestRide(
            this.geoService.waypoints.getValue()[0],
            this.geoService.waypoints.getValue()[1],
            carType.toUpperCase()
        ).subscribe({
          next: () => {
            this.geoService.isSubmitted.next(true);
          },
          error: (error) => {
            if (error.status === 400) {
              this.errorService.showError("Du hast bereits eine aktive Fahranfrage")
              return
            } else if (error.status === 401 || error.status === 403) {
              this.router.navigate(['/login']);
              return
            } else {
              this.errorService.showError(error.error.message);
              return;
            }
          }
        });
      } else {
        this.errorService.showError("Bitte lade zuerst genügend Geld auf dein Konto")
      }
    } else {
      this.onCancel()
    }
  }

  onCancel() {
    this.rideRequestService.cancelRide().subscribe({
      next: () => {
        this.geoService.isSubmitted.next(false);
        this.summaryData = null;
        this.geoService.rideRequestSummaryData.next(null);
        this.rideRequestService.rideRequest.next(null);
        this.mapService.resetMap()
      },
      error: (error) => {
        this.errorService.showError(error.error.message);
      }
    })
  }

  onBack() {
    this.mapService.resetMap()
    this.geoService.showInput.next(true);
  }

  protected readonly parseFloat = parseFloat;
  protected readonly Util = Util;
}
