import { Injectable } from '@angular/core';
import {GeocodeFeature, RideRequest} from '../types';
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
}
