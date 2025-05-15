import {inject, Injectable} from '@angular/core';
import {Coordinates, GeocodeFeature, GeoJsonRoute, RideRequest, RideRequestSummary} from '../../types';
import {BehaviorSubject, firstValueFrom, Observable} from 'rxjs';
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
      private geoService:  GeoService,
      private openRouteService: OpenRouteServiceService
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
        latitude: start.geometry.coordinates[1],
        longitude: start.geometry.coordinates[0]
      },
      destination: {
        latitude: destination.geometry.coordinates[1],
        longitude: destination.geometry.coordinates[0]
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

  public getActiveRide(): Observable<HttpResponse<any>>
  {
    return this.http.get<RideRequest>(
        'http://localhost:8080/api/ride-requests/active',
        {
          headers: {
            accept: 'application/json',
          }
          ,
          observe: 'response'
        }
    )
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

  public async getRideRequestSummaryFromRideRequest(rideRequest: RideRequest): Promise<RideRequestSummary> {
    const startResponse = await firstValueFrom(
      this.openRouteService.getGeocodeFeatureByCoordinates({
        latitude: rideRequest.startLocation.latitude,
        longitude: rideRequest.startLocation.longitude,
      })
    );
    const endFeatureResponse = await firstValueFrom(
      this.openRouteService.getGeocodeFeatureByCoordinates({
        longitude: rideRequest.destination.longitude,
        latitude: rideRequest.destination.latitude,
      })
    );
    const startFeature = startResponse.body?.features[0]
    const endFeature = endFeatureResponse.body?.features[0]

    if (startFeature && endFeature) {
      const cordsArray = this.geoService.getCoordinateArray([startFeature, endFeature]);
      const routeResponse = await firstValueFrom(
          this.openRouteService.getRouteFromPointArray(cordsArray)
      );
      const route = routeResponse.body;
      if (route) {
        this.geoService.updateStart(startFeature)
        this.geoService.updateDestination(endFeature)
        this.geoService.route.next(route)
        let jsonRoute: GeoJsonRoute = route;
        return {
          start: this.geoService.waypoints.getValue()[0].properties.label,
          end: this.geoService.waypoints.getValue()[1].properties.label,
          distance: parseFloat((jsonRoute.features[0].properties.summary.distance / 1000).toFixed(2)),
          duration: parseFloat((jsonRoute.features[0].properties.summary.duration / 60).toFixed(2)),
          price: 0,
          carType: this.geoService.carType.getValue() ?? CarType.MEDIUM,
          stops: []
        };
      }
    }
    return {
      start: "",
      end: "",
      distance: 0,
      stops: [],
      duration: 0,
      price: 0,
      carType: ""
    }
  }

  public getRideRequestSummary(): RideRequestSummary | null
  {
    const carType = this.geoService.carType.getValue();
    if (this.geoService.waypoints.getValue().length > 1 && this.geoService.route.getValue() && carType) {
      let jsonRoute: GeoJsonRoute = this.geoService.route.getValue();
      let waypointsLength = this.geoService.waypoints.getValue().length;
      let stops = this.geoService.waypoints.getValue().slice(1, waypointsLength - 1);

      return {
        start: this.geoService.waypoints.getValue()[0].properties.label,
        stops: stops,
        end: this.geoService.waypoints.getValue()[this.geoService.waypoints.getValue().length-1].properties.label,
        distance: parseFloat((jsonRoute.features[0].properties.summary.distance / 1000).toFixed(2)),
        duration: parseFloat((jsonRoute.features[0].properties.summary.duration / 60).toFixed(2)),
        price: 0,
        carType: carType
      };
    }
    return null;
  }
}
