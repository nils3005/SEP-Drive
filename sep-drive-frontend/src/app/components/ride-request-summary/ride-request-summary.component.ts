import {Component, Input} from '@angular/core';
import {RideRequestSummary} from '../../types';
import {MapService} from '../../services/map/map.service';
import {RideRequestService} from '../../services/riderequest/ride-request.service';
import {GeoService} from '../../services/geo/geo.service';
import {CarType} from '../../enums/car-type';
import {ErrorService} from "../../services/error/error.service";
import {Router} from "@angular/router";
import {BehaviorSubject} from "rxjs";
import {Util} from "leaflet";

@Component({
  selector: 'app-ride-request-summary',
  imports: [],
  templateUrl: './ride-request-summary.component.html',
  styleUrl: './ride-request-summary.component.scss'
})
export class RideRequestSummaryComponent {

  summaryData: RideRequestSummary | null = null;
  @Input() isSubmitted = false;

  constructor(
      private mapService: MapService,
      private rideRequestService: RideRequestService,
      private geoService: GeoService,
      private errorService: ErrorService,
      private router: Router,
  ) {
    if (!rideRequestService.getRideRequestSummary()) {
      geoService.showInput.next(false);
    } else {
      this.summaryData = rideRequestService.getRideRequestSummary();
      console.log(this.summaryData)
    }
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
      this.rideRequestService.requestRide(
          this.geoService.waypoints.getValue()[0],
          this.geoService.waypoints.getValue()[1],
          carType.toUpperCase()
      ).subscribe({
        next: () => {
          this.isSubmitted = true;
          this.geoService.flyMapTo(this.geoService.waypoints.getValue()[0].geometry.coordinates[1], this.geoService.waypoints.getValue()[0].geometry.coordinates[0], 16, 1)
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
      this.onCancel()
    }
  }

  onCancel() {
    this.rideRequestService.cancelRide().subscribe({
      next: () => {
        this.isSubmitted = false;
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
