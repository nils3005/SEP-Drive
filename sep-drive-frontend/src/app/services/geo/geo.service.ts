import {Injectable} from '@angular/core';
import {Coordinates, GeocodeFeature, RideRequestSummary} from '../../types';
import {BehaviorSubject} from "rxjs";
import {OpenRouteServiceService} from "../openroute/open-route-service.service";
import {ErrorService} from '../error/error.service';
import {GeoStoreService} from '../../stores/geo/geo-store.service';

@Injectable({
  providedIn: 'root'
})
export class GeoService {
  public showInput: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public rideRequestSummaryData: BehaviorSubject<RideRequestSummary | null> = new BehaviorSubject<RideRequestSummary | null>(null);
  public isSubmitted: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private openRouteServiceService: OpenRouteServiceService,
    private errorService: ErrorService,
    private geoStoreService: GeoStoreService,
  ) {}

  public getCoordinateArray(geoCodes: GeocodeFeature[]): [number, number][]
  {
    let coordinates: [number, number][] = [];

    for (const geoCode of geoCodes) {
      coordinates.push([geoCode.geometry.coordinates[0], geoCode.geometry.coordinates[1]]);
    }
    return coordinates;
  }

  public calculateRoute(useOptimizedStops: boolean = false)
  {
    let coordinates = this.getCompleteCoordsArray(useOptimizedStops);
    this.openRouteServiceService.getRouteFromPointArray(coordinates).subscribe({
      next: response => {
        this.geoStoreService.route.next(response.body);
        this.geoStoreService.route.next(response.body);
        console.log(response.body);
        this.showInput.next(false);
      },
      error: error => {
        this.errorService.showError("Route konnte nicht berechnet werden");
      }
    })
  }

  public getCompleteCoordsArray(useOptimizedStops: boolean = false): [number, number][]
  {
    let waypoints: GeocodeFeature[] = []
    const start = this.geoStoreService.start.getValue();
    const destination = this.geoStoreService.destination.getValue();
    if (start && destination) {
      waypoints.push(start);
      if (useOptimizedStops) {
        waypoints = waypoints.concat(this.geoStoreService.optimizedStops.getValue());
      } else {
        waypoints = waypoints.concat(this.geoStoreService.stops.getValue());
      }
      waypoints.push(destination);
    }
    return this.getCoordinateArray(waypoints);
  }

  public getCoordinatesByGeoCodeFeature(feature: GeocodeFeature): Coordinates
  {
    return {
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
    }
  }
}
