import {Component, inject, OnInit} from '@angular/core';
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
import {RideOffersComponent} from "../../components/rideoffers/ride-offers.component";
import {RideRequestListComponent} from "../../components/ride-request-list/ride-request-list.component";
import {AuthService} from "../../services/auth/auth-service.service";
import {RouterLink} from "@angular/router";
import {AsyncPipe} from "@angular/common";

@Component({
  selector: 'app-home-page',
  imports: [
    RouteInputComponent,
    MapComponent,
    RideRequestSummaryComponent,
    RideOffersComponent,
    RideRequestListComponent,
    RouterLink
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  public authService: AuthService = inject(AuthService);
  public isLoading = true;

  constructor(
      public rideRequestService: RideRequestService,
      public geoService: GeoService,
  ) {}

  ngOnInit(): void {
    console.log("HomePageComponent ngOnInit");
    console.log("showInput:", this.geoService.showInput.getValue());
    console.log("isSubmitted:", this.geoService.isSubmitted.getValue());

    if(!this.authService.isLoggedIn()) {
      console.log("User ist nicht eingeloggt.") // TODO Entfernen für Abgabe
      this.isLoading = false;
    }

    this.rideRequestService.getActiveRide().subscribe({
      next: (response)=> {
        if (response.status === 200) {
          this.rideRequestService.getRideRequestSummaryFromRideRequest(response.body).then((summary) => {
            this.geoService.rideRequestSummaryData.next(summary);
            this.geoService.isSubmitted.next(true);
            this.geoService.showInput.next(false);
            this.isLoading = false;
          })
        }
      },
      error: (error)=> {
        this.isLoading = false;
        if (error.status === 400 || error.status === 401) {
          // this.errorService.showError(error.message);
          console.log("403 ERROR AUS HOMECOMPONENT:",error);
          if (!this.geoService.rideRequestSummaryData.getValue()) {
            this.geoService.showInput.next(true);
          }
          this.geoService.isSubmitted.next(false);
          return
        }
        if (error.status === 404) {
          console.log("404 ERROR AUS HOMECOMPONENT:",error);
          this.geoService.isSubmitted.next(false);
          this.geoService.showInput.next(true)
        }
        return
      }
    })
  }
}
