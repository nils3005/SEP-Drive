import { Component } from '@angular/core';
import {RouteInputComponent} from "../../components/route-input/route-input.component";
import {MapComponent} from "../../components/map/map.component";
import {RideRequestService} from "../../services/ride-request.service";
import {RideRequestStatus} from "../../enums/ride-request-status";
import {RideRequestSummaryComponent} from "../../components/ride-request-summary/ride-request-summary.component";

@Component({
  selector: 'app-home-page',
  imports: [
    RouteInputComponent,
    MapComponent,
    RideRequestSummaryComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

  public showInput = true;

  constructor(private rideRequestService: RideRequestService) {
    this.checkChanges()
  }

  checkChanges(): void {
    this.rideRequestService.rideRequest.asObservable().subscribe(rideRequest => {
      if (rideRequest && (rideRequest.status === RideRequestStatus.COMPLETED || rideRequest.status === RideRequestStatus.CANCELED)) {
        this.showInput = false;
      }
      if (!rideRequest) {
        this.showInput = true;
      }
    })
  }

}
