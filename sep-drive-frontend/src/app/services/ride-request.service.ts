import { Injectable } from '@angular/core';
import {GeocodeFeature, GeoJsonRoute, RideRequest, RideRequestSummary} from '../types';
import {BehaviorSubject, Observable} from 'rxjs';
import {GeoServiceService} from './geo-service.service';

@Injectable({
  providedIn: 'root'
})
export class RideRequestService {

  public rideRequest: BehaviorSubject<RideRequest | null> = new BehaviorSubject<RideRequest | null>(null);

  constructor(private geoService:  GeoServiceService) { }

  public getRideData()
  {
    return {
      start: this.geoService.waypoints.getValue()[0].properties.name,
      destination: this.geoService.waypoints.getValue()[1].properties.name,
      carType: this.geoService.carType.value,
      distance: this.geoService.route.getValue().features[0].properties.summary.distance,
      duration: this.geoService.route.getValue().features[0].properties.summary.duration,
    }
  }

  public requestRide (start: GeocodeFeature, destination: GeocodeFeature): Observable<RideRequest> | undefined {
    // TODO implemet backend request | remove undefined as return type
    return undefined
  }

  public getRideRequestSummary(): RideRequestSummary | null
  {
    if (this.geoService.waypoints.getValue().length > 1 && this.geoService.route.getValue() && this.geoService.carType.getValue()) {
      let jsonRoute: GeoJsonRoute = this.geoService.route.getValue();
      return {
        start: this.geoService.waypoints.getValue()[0].properties.label,
        end: this.geoService.waypoints.getValue()[1].properties.label,
        distance: parseFloat((jsonRoute.features[0].properties.summary.distance / 1000).toFixed(2)),
        duration: parseFloat((jsonRoute.features[0].properties.summary.duration / 60).toFixed(2)),
        price: 0,
        carType: this.geoService.carType.getValue()
      };
    }
    return null;
  }
}
