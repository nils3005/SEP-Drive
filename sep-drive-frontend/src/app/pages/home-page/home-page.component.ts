import { Component } from '@angular/core';
import {RouteInputComponent} from "../../components/route-input/route-input.component";
import {MapComponent} from "../../components/map/map.component";
import {GeocodeFeature} from "../../types";
import {OpenRouteServiceService} from "../../services/openroute/open-route-service.service";
import * as L from 'leaflet';
import {GeoServiceService} from "../../services/geo/geo-service.service";

@Component({
  selector: 'app-home-page',
  imports: [
    RouteInputComponent,
    MapComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
  public waypoints: GeocodeFeature[] = [];
  public currentPoint: GeocodeFeature | undefined;
  public route: any

  constructor(
      private openRouteServiceService: OpenRouteServiceService,
      private geoServiceService: GeoServiceService
  ) {}

  onStartEmit(start: GeocodeFeature) {
    let tempWaypoints = this.waypoints.slice();
    tempWaypoints[0] = start;
    this.waypoints = tempWaypoints;
    this.currentPoint = start;
  }

  onDestinationEmit(destination: GeocodeFeature) {
    let tempWaypoints = this.waypoints.slice();
    if (tempWaypoints.length > 1) {
      tempWaypoints[tempWaypoints.length - 1] = destination;
    } else {
      tempWaypoints[1] = destination;
    }
    this.waypoints = tempWaypoints;
    this.currentPoint = destination;
  }

  onSubmitEventEmit() {
    let coordinates = this.geoServiceService.getCoordinateArray(this.waypoints)
    this.openRouteServiceService.getRouteFromPointArray(coordinates).subscribe(route => {
      this.route = route;
    })
  }
}
