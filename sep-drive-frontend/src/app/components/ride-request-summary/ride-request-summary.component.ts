import {Component} from '@angular/core';
import {RideRequestSummary} from '../../types';
import {MapService} from '../../services/map/map.service';
import {RideRequestService} from '../../services/riderequest/ride-request.service';
import {GeoService} from '../../services/geo/geo.service';
import {CarType} from '../../enums/car-type';
import {Util} from "leaflet";

@Component({
  selector: 'app-ride-request-summary',
  imports: [],
  templateUrl: './ride-request-summary.component.html',
  styleUrl: './ride-request-summary.component.scss'
})
export class RideRequestSummaryComponent {

  summaryData: RideRequestSummary | null = null;
  isSubmitted = false;

  constructor(private mapService: MapService, private rideRequestService: RideRequestService, private geoService: GeoService) {
    if (!rideRequestService.getRideRequestSummary()) {
      geoService.showInput.next(false);
    } else {
      this.summaryData = rideRequestService.getRideRequestSummary();
      console.log(this.summaryData)
    }
  }

  public minutesToHHMM(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60); // Ensure no fractions here
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  }

  onSubmit() {
    if (this.geoService.waypoints.getValue().length > 1 && this.geoService.carType.getValue()) {
      this.rideRequestService.requestRide(this.geoService.waypoints.getValue()[0], this.geoService.waypoints.getValue()[1], this.geoService.carType.getValue()?.toString() ?? CarType.MEDIUM.toString());
      this.isSubmitted = true;
      this.geoService.flyMapTo(this.geoService.waypoints.getValue()[0].geometry.coordinates[1], this.geoService.waypoints.getValue()[0].geometry.coordinates[0], 16, 1)
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

  onBack() {
    this.mapService.resetMap()
    this.geoService.showInput.next(true);
  }

  protected readonly parseFloat = parseFloat;
  protected readonly Util = Util;
}
