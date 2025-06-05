import {Component, OnInit} from '@angular/core';
import {RouteInputComponent} from "../../components/route-input/route-input.component";
import {MapComponent} from "../../components/map/map.component";
import {RideRequestService} from "../../services/riderequest/ride-request.service";
import {RideRequestStatus} from "../../enums/ride-request-status";
import {RideRequestSummaryComponent} from "../../components/ride-request-summary/ride-request-summary.component";
import {GeoService} from "../../services/geo/geo.service";
import {RideRequestSummary} from "../../types";
import {ErrorService} from "../../services/error/error.service";
import {BehaviorSubject} from "rxjs";
import {UserService} from "../../services/user/user.service";
import {jwtDecode} from "jwt-decode";
import {RideSimulationComponent} from '../../components/ride-simulation/ride-simulation.component';

@Component({
  selector: 'app-home-page',
  imports: [
    RouteInputComponent,
    MapComponent,
    RideRequestSummaryComponent,
    RideSimulationComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {

  constructor(
      public rideRequestService: RideRequestService,
      public geoService: GeoService,
      private userService: UserService
  ) {}

  public isAccepted: boolean = true;
  public showOnlyMap = false;

  ngOnInit(): void {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      const decode = jwtDecode(jwt);
      if (decode.sub) {
        this.userService.getUserByUsername(decode.sub).subscribe(user => {
          if (user.role == "CUSTOMER") {
            this.showOnlyMap = false;
          } else if (user.role == "DRIVER") {
            this.showOnlyMap = true;
          }
        })
      }
    }
    if (!this.isAccepted) {
      this.rideRequestService.getActiveRide().subscribe({
        next: (response)=> {
          if (response.status === 200) {
            this.rideRequestService.getRideRequestSummaryFromRideRequest(response.body).then((summary) => {
              this.geoService.rideRequestSummaryData.next(summary);
              this.geoService.isSubmitted.next(true);
            })
          }
        },
        error: (error)=> {
          if (error.status === 403 || error.status === 401) {
            // this.errorService.showError(error.message);
            this.geoService.showInput.next(true)
            this.geoService.isSubmitted.next(false);
            return
          }
          if (error.status === 404) {
            this.geoService.isSubmitted.next(false);
            this.geoService.showInput.next(true)
          }
          return
        }
      })
    }
  }
}
