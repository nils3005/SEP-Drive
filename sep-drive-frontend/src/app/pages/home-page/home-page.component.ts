import {Component, effect, Inject, inject, OnInit, signal} from '@angular/core';
import {RouteInputComponent} from "../../components/route-input/route-input.component";
import {MapComponent} from "../../components/map/map.component";
import {RideRequestService} from "../../services/riderequest/ride-request.service";
import {RideRequestSummaryComponent} from "../../components/ride-request-summary/ride-request-summary.component";
import {GeoService} from "../../services/geo/geo.service";
import {RideOffersComponent} from "../../components/rideoffers/ride-offers.component";
import {RideRequestListComponent} from "../../components/ride-request-list/ride-request-list.component";
import {AuthService} from "../../services/auth/auth-service.service";
import {Router, RouterLink} from "@angular/router";
import {UserService} from "../../services/user/user.service";
import {RideService} from '../../services/ride/ride.service';
import {RideofferService} from "../../services/rideoffer/rideoffer.service";
import {ChatComponent} from "../../components/chat/chat.component";
import {catchError, interval, map, Observable, of, startWith, switchMap} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-home-page',
  imports: [
    RouteInputComponent,
    MapComponent,
    RideRequestSummaryComponent,
    RideOffersComponent,
    RideRequestListComponent,
    RouterLink,
    ChatComponent,
    AsyncPipe
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  public authService: AuthService = inject(AuthService);
  public geoService: GeoService = inject(GeoService);
  public rideRequestService: RideRequestService = inject(RideRequestService)
  private userService: UserService = inject(UserService)
  private rideService: RideService = inject(RideService)
  private router: Router = inject(Router)
  public rideOfferService: RideofferService = inject(RideofferService);

  user$ = toObservable(this.authService.user);
  hasRideOffer = toSignal(
      interval(3000).pipe(             // alle 3 Sekunden
          startWith(0),
          switchMap(() => this.user$),            // Wenn user() ein Signal ist:
          switchMap(user => {
            if (user?.role === 'DRIVER') {
              return this.rideOfferService.getPendingOfferForDriver(user.id).pipe(
                  map(offer => !!offer),
                  catchError(() => of(false))
              );
            } else {
              return of(false);
            }
          })
      ),
      { initialValue: false }
  );

  ngOnInit(): void {
    this.rideRequestService.getActiveRideRequest().subscribe({
      next: (response)=> {
        if (response.status === 200) {
          this.rideRequestService.getRideRequestSummaryFromRideRequest(response.body).then((summary) => {
            this.geoService.rideRequestSummaryData.next(summary);
            this.geoService.isSubmitted.next(true);
            this.geoService.showInput.next(false);
          })
        }
      },
      error: (error)=> {
        if (error.status === 400 || error.status === 401) {
          // this.errorService.showError(error.message);
          console.log("403 ERROR AUS HOMECOMPONENT:",error);
          this.rideService.getActiveRide().subscribe({
            next: (response)=> {
              this.router.navigateByUrl("/simulation");
            }
          })
          if (!this.geoService.rideRequestSummaryData.getValue()) {
            this.geoService.showInput.next(true);
          }
          this.geoService.isSubmitted.next(false);
          return
        }
        if (error.status === 404) {
          console.log("404 ERROR AUS HOMECOMPONENT:",error);
          this.rideService.getActiveRide().subscribe({
            next: (response)=> {
              this.router.navigateByUrl("/simulation");
            }
          })
          this.geoService.isSubmitted.next(false);
          this.geoService.showInput.next(true)
        }
        return
      }
    })
  }
}
