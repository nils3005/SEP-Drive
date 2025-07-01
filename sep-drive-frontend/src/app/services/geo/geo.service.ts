import {Injectable} from '@angular/core';
import {Coordinates, GeocodeFeature, RideRequestSummary} from '../../types';
import {BehaviorSubject} from "rxjs";
import {OpenRouteServiceService} from "../openroute/open-route-service.service";
import * as L from 'leaflet';
import {ErrorService} from '../error/error.service';
import {GeoStoreService} from '../../stores/geo/geo-store.service';

@Injectable({
  providedIn: 'root'
})
export class GeoService {

  // public waypoints: BehaviorSubject<GeocodeFeature[]> = new BehaviorSubject<GeocodeFeature[]>([]);
  // public route: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  // public currentPoint: BehaviorSubject<GeocodeFeature | null> = new BehaviorSubject<GeocodeFeature | null>(null);
  // public carType: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  public showInput: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public rideRequestSummaryData: BehaviorSubject<RideRequestSummary | null> = new BehaviorSubject<RideRequestSummary | null>(null);

  // public map: L.Map | undefined;

  public isSubmitted: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private openRouteServiceService: OpenRouteServiceService, private errorService: ErrorService, private geoStoreService: GeoStoreService) {}

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
    let coordinates = this.getCompleteCoordsArray();
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

  // public updateStart(start: GeocodeFeature, zoom: boolean = true): void
  // {
  //   let tempWaypoints = this.waypoints.getValue();
  //   tempWaypoints[0] = start;
  //   this.waypoints.next(tempWaypoints);
  //   if (zoom) {
  //     this.currentPoint.next(start);
  //   }
  // }
  //
  // public updateDestination(destination: GeocodeFeature, zoom: boolean = true): void
  // {
  //   let tempWaypoints = this.waypoints.getValue();
  //   if (tempWaypoints.length <= 1) {
  //     tempWaypoints[1] = destination;
  //   }
  //   tempWaypoints[tempWaypoints.length - 1] = destination;
  //   this.waypoints.next(tempWaypoints);
  //   if (zoom) {
  //     this.currentPoint.next(destination);
  //   }
  // }

  // public addStop(stop: GeocodeFeature): void
  // {
  //   let tempWaypoints = this.waypoints.getValue();
  //   tempWaypoints.splice(1, 0, stop)
  //   this.waypoints.next(tempWaypoints);
  //   this.currentPoint.next(stop);
  // }
  //
  // public removeStop(stop: GeocodeFeature): void
  // {
  //   let tempWaypoints = this.waypoints.getValue();
  //   const index = tempWaypoints.indexOf(stop);
  //   if (index > -1) {
  //     tempWaypoints.splice(index, 1);
  //   }
  //   this.waypoints.next(tempWaypoints);
  // }

  public flyMapTo(latitude: number, longitude: number, zoom: number, duration: number): void
  {
    this.geoStoreService.map?.flyTo([latitude, longitude],
      zoom,
      {
        duration: duration
      }
    )
  }

  public getCompleteCoordsArray(): number[][]
  {
    let stopps = this.geoStoreService.stopps.getValue();
    const start = this.geoStoreService.start.getValue();
    const destination = this.geoStoreService.destination.getValue();
    if (start && destination) {
      stopps.unshift(start);
      stopps.push(destination);
    }
    return this.getCoordinateArray(stopps);
  }

  // public getStart(): GeocodeFeature | null
  // {
  //   return this.waypoints.getValue()[0];
  // }
  //
  // public getDestination(): GeocodeFeature | null
  // {
  //   return this.waypoints.getValue()[this.waypoints.getValue().length - 1];
  // }
}
