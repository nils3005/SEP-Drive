import { Injectable } from '@angular/core';
import {GeocodeFeature, GeoJsonRoute, RideRequest, RideRequestSummary} from '../../types';
import {BehaviorSubject, Observable} from 'rxjs';
import {GeoService} from '../geo/geo.service';
import {CarType} from "../../enums/car-type";

@Injectable({
  providedIn: 'root'
})
export class RideRequestService {

  public rideRequest: BehaviorSubject<RideRequest | null> = new BehaviorSubject<RideRequest | null>(null);

  constructor(private geoService:  GeoService) { }

  public requestRide (start: GeocodeFeature, destination: GeocodeFeature, carType: string): Observable<RideRequest> | undefined {
    // TODO implemet backend request | remove undefined as return type
    return undefined
  }

  public cancelRide(): void
  {
    // TODO implement cancel request
  }

  public getRideRequestSummary(): RideRequestSummary | null
  {
    if (this.geoService.waypoints.getValue().length > 1 && this.geoService.route.getValue() && this.geoService.carType.getValue()) {
      let jsonRoute: GeoJsonRoute = this.geoService.route.getValue();
      let waypointsLength = this.geoService.waypoints.getValue().length;
      let stops = this.geoService.waypoints.getValue().slice(1, waypointsLength - 1);
      let stopsString: string[] = []
      for (const stop of stops) {
        stopsString.push(stop.properties.label)
      }

      return {
        start: this.geoService.waypoints.getValue()[0].properties.label,
        stops: stopsString,
        end: this.geoService.waypoints.getValue()[this.geoService.waypoints.getValue().length-1].properties.label,
        distance: parseFloat((jsonRoute.features[0].properties.summary.distance / 1000).toFixed(2)),
        duration: parseFloat((jsonRoute.features[0].properties.summary.duration / 60).toFixed(2)),
        price: 0,
        carType: this.geoService.carType.getValue() ?? CarType.MEDIUM
      };
    }
    return null;
  }
}
