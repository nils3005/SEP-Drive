import { Component } from '@angular/core';
import {RouteInputComponent} from "../../components/route-input/route-input.component";
import {MapComponent} from "../../components/map/map.component";
import {RideRequestService} from "../../services/riderequest/ride-request.service";
import {RideRequestStatus} from "../../enums/ride-request-status";
import {RideRequestSummaryComponent} from "../../components/ride-request-summary/ride-request-summary.component";
import {GeoService} from "../../services/geo/geo.service";

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

  public showInput = false;

  constructor(public rideRequestService: RideRequestService, public geoService: GeoService) {
  }
}
