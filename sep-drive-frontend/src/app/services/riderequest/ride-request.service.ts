import {inject, Injectable} from '@angular/core';
import {Coordinates, GeocodeFeature, GeoJsonRoute, RideRequest, RideRequestSummary} from '../../types';
import {BehaviorSubject, Observable} from 'rxjs';
import {GeoService} from '../geo/geo.service';
import {CarType} from "../../enums/car-type";
import {HttpClient, HttpResponse} from "@angular/common/http";
import {OpenRouteServiceService} from "../openroute/open-route-service.service";
import {ErrorService} from "../error/error.service";

@Injectable({
  providedIn: 'root'
})
export class RideRequestService {
  private http = inject(HttpClient);
  public rideRequest: BehaviorSubject<RideRequest | null> = new BehaviorSubject<RideRequest | null>(null);

  constructor(
      private geoService:  GeoService
  ) { }

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

  public requestRide (start: GeocodeFeature, destination: GeocodeFeature, carType: string): Observable<HttpResponse<any>>
  {
    const rideRequest = {
      startLocation: {
        latitude: start.geometry.coordinates[0],
        longitude: start.geometry.coordinates[1]
      },
      destination: {
        latitude: destination.geometry.coordinates[0],
        longitude: destination.geometry.coordinates[1]
      },
      carType: carType
    }
    return this.http.post<any>(
        'http://localhost:8080/api/ride-requests/create',
        rideRequest,
        {
          headers: {
            accept: 'application/json',
          }
          ,
          observe: 'response'
        }
    )
  }

  public getActiveRide(): void
  {
    this.http.get<RideRequest>(
        'http://localhost:8080/api/ride-requests/active',
        {
          headers: {
            accept: 'application/json',
          }
          ,
          observe: 'response'
        }
    ).subscribe({
      next: (response)=> {
        if (response.status === 200) {
          this.rideRequest.next(response.body)
        }
      },
      error: (error)=> {
        if (error.status === 404) {
          this.rideRequest.next(null);
        }
      }
    })
  }

  public cancelRide(): Observable<HttpResponse<any>>
  {
    return this.http.delete<any>(
        'http://localhost:8080/api/ride-requests/cancel',
        {
          headers: {
            accept: 'application/json',
          }
          ,
          observe: 'response'
        }
    )
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
        carType: this.geoService.carType.getValue() ?? CarType.MEDIUM
      };
    }
    return null;
  }
}
