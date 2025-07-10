import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RideSimulationStore} from '../../stores/rideSimulation/ride-simulation-store.service';
import {
  Coord,
  Coordinates,
  GeocodeFeature,
  GeoJsonRoute, Ride, RideCords,
  RideDto,
  RideResponse,
  RideUpdateDTO
} from '../../types';
import {ErrorService} from '../error/error.service';
import {firstValueFrom, Observable} from 'rxjs';

/**
 * import in main.ts wird vor angular bootstraps evaluiert
 * funktioniert bei ng serve, da das script injection verhalten nicht so strikt ist, wie bei ng build, was im docker benutzt wird
 */
declare const L: any;
import {Router} from "@angular/router";
import {GeoStoreService} from '../../stores/geo/geo-store.service';
import {marker} from 'leaflet';
import {GeoService} from '../geo/geo.service';
import {OpenRouteServiceService} from '../openroute/open-route-service.service';

@Injectable({
  providedIn: 'root'
})
export class RideService {

  private httpClient: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);


  constructor(
    private rideSimulationStore: RideSimulationStore,
    private errorService: ErrorService,
    private geoStoreService: GeoStoreService,
    private openRouteService: OpenRouteServiceService
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
      this.rideSimulationStore.motionPolyLine.addTo(this.geoStoreService.map);
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

  private updateRide(rideData: RideUpdateDTO): void
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

  updateRideData(
    paused: boolean | null,
    resuming: boolean | null,
    speed: number | null,
    completed: boolean |null
  ): void
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

  editRideData(
    distance: number,
    duration: number,
    destination: GeocodeFeature | null = null,
    waypoints: GeocodeFeature[] | null = null,
    geoJson: any = null
  ): void {
    let rideData: RideUpdateDTO = this.rideSimulationStore.rideData.getValue();
    rideData.distance = distance;
    rideData.duration = duration;
    if (destination) {
      rideData.destination = {
        latitude: destination.geometry.coordinates[0],
        longitude: destination.geometry.coordinates[1]
      }
    }
    if (waypoints) {
      let stops: Coordinates[] = [];
      for (const waypoint of waypoints) {
        stops.push({
          latitude: waypoint.geometry.coordinates[0],
          longitude: waypoint.geometry.coordinates[1]
        });
      }
      rideData.waypoints = stops;
    }
    if (geoJson) {
      const tempJson: GeoJsonRoute = geoJson;
      rideData.geoJson = JSON.stringify(geoJson);
      rideData.distance = tempJson.features[0].properties.summary.distance;
      rideData.duration = tempJson.features[0].properties.summary.duration;
    }
    this.editRide(rideData);
  }

  private editRide(rideData: RideUpdateDTO): void {
    this.httpClient.post(
      'http://localhost:8080/ride/updateRoute',
      rideData,
      {responseType: "text"}
    ).subscribe((response) => {
      if (response != "Route updated") {
        this.errorService.showError(response)
      }
    })
  }

  getCoordsIndex(): number {
    const ride = this.rideSimulationStore.ride.getValue();
    if (ride) {
      return this.findClosestCoordinateIndex(ride.coords, [this.rideSimulationStore.motionPolyLine.__marker.getLatLng().lat, this.rideSimulationStore.motionPolyLine.__marker.getLatLng().lng])
    }
    return -1;
  }

  async addMarkerPositionToWaypointArray(waypoints: GeocodeFeature[]): Promise<GeocodeFeature[]> {
    const markerPosition = this.getMarkerPosition()
    const markerFeature = await firstValueFrom(
      this.openRouteService.getGeocodeFeatureByCoordinates(markerPosition)
    );
    const ride = this.rideSimulationStore.ride.getValue();
    if (ride) {
      let closestIndex = this.findClosestCoordinateIndex(this.getCoordsArrayFromGeocodeFeatureArray(waypoints), [Number(markerPosition.latitude), Number(markerPosition.longitude)])
      if (markerFeature.body) {
        waypoints.splice(closestIndex, 0, markerFeature.body.features[0]);
      }
    }
    return waypoints;
  }

  getCoordsArrayFromGeocodeFeatureArray(features: GeocodeFeature[]): Coord[] {
    let coords: Coord[] = []
    for (const feature of features) {
      coords.push([feature.geometry.coordinates[0], feature.geometry.coordinates[1]])
    }
    return coords;
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

  getMarkerPosition(): Coordinates {
    const markerPosition = this.rideSimulationStore.motionPolyLine.__marker.getLatLng();
    return {
      latitude: markerPosition.lat,
      longitude: markerPosition.lng
    }
  }

  updateIndexesOnGeocodeFeatures(ride: RideResponse, features: GeocodeFeature[]): GeocodeFeature[] {
    for (const feature of features) {
      feature.properties.index = this.findClosestCoordinateIndex(
        ride.coords,
        [feature.geometry.coordinates[0], feature.geometry.coordinates[1]],
      )
    }
    return features;
  }

  mergePastRouteAndFutureWaypoints(ride: RideResponse, waypoints: GeocodeFeature[]): RideCords {
    const routeCords = ride.coords;
    const markerPosition = this.getMarkerPosition();
    const markerIndex = this.findClosestCoordinateIndex(routeCords, [Number(markerPosition.latitude), Number(markerPosition.longitude)]);
    const indexedWaypoints = this.updateIndexesOnGeocodeFeatures(ride, waypoints);

    let routeWaypointArray: RideCords = [];
    let markerInserted = false;

    for (const waypoint of indexedWaypoints) {
      if (
        !markerInserted &&
        waypoint.properties.index !== undefined &&
        waypoint.properties.index > markerIndex
      ) {
        routeWaypointArray.push([Number(markerPosition.longitude), Number(markerPosition.latitude)]);
        markerInserted = true;
      }
      routeWaypointArray.push([
        waypoint.geometry.coordinates[0],
        waypoint.geometry.coordinates[1],
      ]);
    }

    if (!markerInserted) {
      routeWaypointArray.push([Number(markerPosition.longitude), Number(markerPosition.latitude)]);
    }

    console.log(routeWaypointArray)

    return routeWaypointArray;
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
