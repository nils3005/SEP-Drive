import {Injectable} from '@angular/core';
import {Coordinates, GeocodeFeature, RideRequestSummary} from '../../types';
import {BehaviorSubject} from "rxjs";
import {OpenRouteServiceService} from "../openroute/open-route-service.service";
import * as L from 'leaflet';
import {ErrorService} from '../error/error.service';

@Injectable({
  providedIn: 'root'
})
export class GeoService {

  public waypoints: BehaviorSubject<GeocodeFeature[]> = new BehaviorSubject<GeocodeFeature[]>([]);
  public route: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public currentPoint: BehaviorSubject<GeocodeFeature | null> = new BehaviorSubject<GeocodeFeature | null>(null);
  public carType: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  public showInput: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public rideRequestSummaryData: BehaviorSubject<RideRequestSummary | null> = new BehaviorSubject<RideRequestSummary | null>(null);

  public map: L.Map | undefined;

  constructor(private openRouteServiceService: OpenRouteServiceService, private errorService: ErrorService) {}

  public getCoordinateArray(geoCodes: GeocodeFeature[]): number[][]
  {
    let coordinates: number[][] = [];

    for (const geoCode of geoCodes) {
      coordinates.push([geoCode.geometry.coordinates[0], geoCode.geometry.coordinates[1]]);
    }
    return coordinates;
  }

  public calculateRoute()
  {
    let coordinates = this.getCoordinateArray(this.waypoints.getValue());
    this.openRouteServiceService.getRouteFromPointArray(coordinates).subscribe({
      next: response => {
        this.route.next(response.body);
        this.showInput.next(false);
      },
      error: error => {
        this.errorService.showError("Route konnte nicht berechnet werden");
      }
    })
  }

  public updateStart(start: GeocodeFeature): void
  {
    let tempWaypoints = this.waypoints.getValue();
    tempWaypoints[0] = start;
    this.waypoints.next(tempWaypoints);
    this.currentPoint.next(start);
  }

  public updateDestination(destination: GeocodeFeature): void
  {
    let tempWaypoints = this.waypoints.getValue();
    if (tempWaypoints.length > 1) {
      tempWaypoints[tempWaypoints.length - 1] = destination;
    } else {
      tempWaypoints[1] = destination;
    }
    this.waypoints.next(tempWaypoints);
    this.currentPoint.next(destination);
  }

  public flyMapTo(latitude: number, longitude: number, zoom: number, duration: number): void
  {
    this.map?.flyTo([latitude, longitude],
      zoom,
      {
        duration: duration
      }
    )
  }
}
