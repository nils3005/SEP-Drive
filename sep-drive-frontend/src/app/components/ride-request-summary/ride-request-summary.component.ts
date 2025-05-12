import {Component} from '@angular/core';
import {RideRequestSummary} from '../../types';
import {GeoServiceService} from '../../services/geo-service.service';
import {RideRequestService} from '../../services/ride-request.service';

@Component({
  selector: 'app-ride-request-summary',
  imports: [],
  templateUrl: './ride-request-summary.component.html',
  styleUrl: './ride-request-summary.component.scss'
})
export class RideRequestSummaryComponent {

  summaryData: RideRequestSummary | null = null;

  constructor(private rideRequestService: RideRequestService, private geoService: GeoServiceService) {
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

  protected readonly parseFloat = parseFloat;
}
