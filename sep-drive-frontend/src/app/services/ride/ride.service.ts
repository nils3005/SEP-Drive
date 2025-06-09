import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {RideSimulationStore} from '../../stores/rideSimulation/ride-simulation-store.service';
import {Ride, RideResponse, RideUpdateDTO} from '../../types';
import {ErrorService} from '../error/error.service';
import {Observable, of} from 'rxjs';
import * as L from 'leaflet';
import 'leaflet.motion/dist/leaflet.motion.js'
import {GeoService} from '../geo/geo.service';

@Injectable({
  providedIn: 'root'
})
export class RideService {

  private httpClient: HttpClient = inject(HttpClient);


  constructor(
    private rideSimulationStore: RideSimulationStore,
    private errorService: ErrorService,
    private geoService: GeoService
  ) {
  }

  async simulateRide() {
    const ride = this.rideSimulationStore.ride.getValue();
    if (ride) {
      // const total = ride.speeds.reduce((sum, val) => sum + val, 0);
      const speed = ride.ride.speed
      // console.log(speed);
      // console.log(ride.ride.distance)
      this.rideSimulationStore.motionPolyLine = (L as any).motion.polyline(ride.coords, {
        color: "transparent"
      }, {
        auto: false,
        speed: this.calculateKmh(ride.ride.distance, speed)
      }, {
        showMarker: true,
        icon: L.divIcon({
          html: "<i class='fa fa-car fa-2x' aria-hidden='true'></i>",
          iconSize: L.point(27.5, 24)
        })
      });

      this.rideSimulationStore.motionPolyLine.addTo(this.geoService.map);
      this.checkUpdates()
    }
  }

  checkUpdates() {
    this.rideSimulationStore.motionPolyLine.on((L as any).Motion.Event.Ended, () => {
      let rideData: RideUpdateDTO = this.rideSimulationStore.rideData.getValue();
      rideData.completed = true;
      this.rideSimulationStore.rideData.next(rideData);
      this.updateRide()
    });
  }

  getActiveRide(): Observable<RideResponse>
  {
    return this.httpClient.get<any>(
      'http://localhost:8080/ride/active'
    )
  }

  updateRide(): void
  {
    this.httpClient.post(
      'http://localhost:8080/ride/updateRide',
      this.rideSimulationStore.rideData.getValue(),
      {responseType: "text"}
    ).subscribe((response) => {
      if (response != "Ride updated") {
        this.errorService.showError(response)
      }
    })
  }

  calculateKmh(meters: number, seconds: number): number {
    if (seconds === 0) {
      return Infinity;
    }
    const km = meters / 1000;
    const hours = seconds / 3600;
    const kmh = km / hours;
    return kmh;
  }
}
