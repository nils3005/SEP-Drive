import {Component} from '@angular/core';
import {RideRequestSummary} from '../../types';
import {MapService} from '../../services/map/map.service';
import {RideRequestService} from '../../services/riderequest/ride-request.service';
import {GeoService} from '../../services/geo/geo.service';
import {CarType} from '../../enums/car-type';
import {ErrorService} from "../../services/error/error.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-ride-request-summary',
  imports: [],
  templateUrl: './ride-request-summary.component.html',
  styleUrl: './ride-request-summary.component.scss'
})
export class RideRequestSummaryComponent {

  summaryData: RideRequestSummary | null = null;
  isSubmitted = false;

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
    }
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
        next: (response) => {
          this.isSubmitted = true;
          this.geoService.flyMapTo(this.geoService.waypoints.getValue()[0].geometry.coordinates[1], this.geoService.waypoints.getValue()[0].geometry.coordinates[0], 16, 1)
          console.log(response);
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
    this.rideRequestService.cancelRide()
    this.mapService.resetMap()
    this.summaryData = null;
    this.isSubmitted = false;
  }

  protected readonly parseFloat = parseFloat;
}
