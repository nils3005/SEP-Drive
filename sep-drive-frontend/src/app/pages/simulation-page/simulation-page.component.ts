import { Component } from '@angular/core';
import {MapComponent} from "../../components/map/map.component";
import {RideSimulationStore} from '../../stores/rideSimulation/ride-simulation-store.service';
import {RideSimulationComponent} from '../../components/ride-simulation/ride-simulation.component';
import {AuthService} from '../../services/auth/auth-service.service';
import {RideService} from '../../services/ride/ride.service';
import {Router} from '@angular/router';
import {MapService} from '../../services/map/map.service';

@Component({
  selector: 'app-simulation-page',
  imports: [
    MapComponent,
    RideSimulationComponent
  ],
  templateUrl: './simulation-page.component.html',
  styleUrl: './simulation-page.component.scss'
})
export class SimulationPageComponent {

  public rating: number = 0;

  constructor(
    public rideSimulationStore: RideSimulationStore,
    private authService: AuthService,
    private rideService: RideService,
    private router: Router,
    private mapService: MapService
  ) {
  }

  setRating(rating: number) {
    this.rating = rating;
  }

  submit(rating: number | null) {
    const historyId = this.rideSimulationStore.rideData.getValue().historyId;
    const thisUserId = this.authService.user()?.id;
    const otherUserId = this.rideSimulationStore.ride.getValue()?.ride.customer.id == thisUserId ? this.rideSimulationStore.ride.getValue()?.ride.driver.id : this.rideSimulationStore.ride.getValue()?.ride.customer.id
    console.log("Rate")
    console.log(otherUserId);
    console.log(thisUserId);
    console.log(historyId);
    console.log(rating);
    if (historyId && otherUserId && thisUserId && rating) {
      this.rideService.rateUser(otherUserId, historyId, rating);
      this.mapService.resetMap();
    }
    this.router.navigate(['/']);
  }
}
