import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {RideSimulationStore} from '../../stores/rideSimulation/ride-simulation-store.service';
import {Coord, Ride, RideDto, RideResponse, RideUpdateDTO} from '../../types';
import {ErrorService} from '../error/error.service';
import {Observable} from 'rxjs';

/**
 * import in main.ts wird vor angular bootstraps evaluiert
 * funktioniert bei ng serve, da das script injection verhalten nicht so strikt ist, wie bei ng build, was im docker benutzt wird
 */
declare const L: any;
import {GeoService} from '../geo/geo.service';
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class RideService {

  private httpClient: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);


  constructor(
    private rideSimulationStore: RideSimulationStore,
    private errorService: ErrorService,
    private geoService: GeoService
  ) {
  }

  async simulateRide() {
    const ride = this.rideSimulationStore.ride.getValue();
    if (ride) {
      const speed = ride.ride.speed
      this.rideSimulationStore.motionPolyLine = (L as any).motion.polyline(ride.coords.slice(this.rideSimulationStore.rideData.getValue().coordsIndex), {
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
      this.updateRide(rideData)
    });
  }

  getActiveRide(): Observable<RideResponse>
  {
    return this.httpClient.get<any>(
      'http://localhost:8080/ride/active'
    )
  }

  updateRide(rideData: RideUpdateDTO): void
  {
    this.httpClient.post(
      'http://localhost:8080/ride/updateRide',
      rideData,
      {responseType: "text"}
    ).subscribe((response) => {
      if (response != "Ride updated") {
        this.errorService.showError(response)
      }
    })
  }

  createRide(ride: RideDto): void {
    this.httpClient.post(
        'http://localhost:8080/ride/add',
        ride,
        { responseType: 'text' }
    ).subscribe({
      next: _ => {
        this.router.navigate(['/simulation']);
      },
      error: err =>
          console.log(err)
    })
  }

  updateRideData(paused: boolean | null, resuming: boolean | null, speed: number | null, completed: boolean |null): void
  {
    let rideData: RideUpdateDTO = this.rideSimulationStore.rideData.getValue();
    rideData.completed = completed ?? rideData.completed;
    rideData.paused = paused ?? rideData.paused;
    rideData.resuming = resuming?? rideData.resuming;
    rideData.speed = speed ?? rideData.speed;
    rideData.coordsIndex = this.getCoordsIndex() != -1 ? this.getCoordsIndex() : rideData.coordsIndex;
    this.rideSimulationStore.rideData.next(rideData);
    this.updateRide(rideData)
  }

  getCoordsIndex(): number {
    const ride = this.rideSimulationStore.ride.getValue();
    if (ride) {
      return this.findClosestCoordinateIndex(ride.coords, [this.rideSimulationStore.motionPolyLine.__marker.getLatLng().lat, this.rideSimulationStore.motionPolyLine.__marker.getLatLng().lng])
    }
    return -1;
  }

  updateIndex(): void {
    if (this.rideSimulationStore.motionPolyLine) {
      const index = this.getCoordsIndex();
      this.httpClient.post(`http://localhost:8080/ride/updateIndex/${this.rideSimulationStore.ride.getValue()?.ride.rideId ?? 0}/${index}`,
        index,
        {
          responseType: "text"
        }
      )
    }
  }

  rateUser(userId: number, historyId: number, rating: number): void {
    const ratingDto = {
      rating: rating
    };
    this.httpClient.post(`http://localhost:8080/ratings/${userId}/${historyId}`, ratingDto).subscribe({
      next: _ => {
      },
      error: err => {
        console.log("Error ", err)
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

  findClosestCoordinateIndex(coords: Coord[], target: Coord): number {
    let closestIndex = -1;
    let minDistance = Infinity;

    for (let i = 0; i < coords.length; i++) {
      const dist = this.haversineDistance(coords[i], target);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

  haversineDistance(coord1: Coord, coord2: Coord): number {
    const toRad = (x: number) => x * Math.PI / 180;

    const [lat1, lon1] = [coord1[1], coord1[0]];
    const [lat2, lon2] = [coord2[1], coord2[0]];

    const R = 6371e3; // Earth radius in meters
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);
    const deltaLat = toRad(lat2 - lat1);
    const deltaLon = toRad(lon2 - lon1);

    const a = Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
