import { Component } from '@angular/core';
import {RouteInputComponent} from "../../components/route-input/route-input.component";
import {MapComponent} from "../../components/map/map.component";
import {GeocodeFeature} from "../../types";
import {OpenRouteServiceService} from "../../services/open-route-service.service";
import * as L from 'leaflet';

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
  public startPoint: GeocodeFeature | undefined;
  public destinationPoint: GeocodeFeature | undefined;
  public route: any

  constructor(private openRouteServiceService: OpenRouteServiceService) {
  }

  onStartEmit(start: GeocodeFeature) {
    this.startPoint = start;
  }

  onDestinationEmit(destination: GeocodeFeature) {
    this.destinationPoint = destination;
  }

  onSubmitEventEmit() {
    if (this.startPoint && this.destinationPoint) {
      if (this.startPoint) {
        this.openRouteServiceService.getRouteBetweenPoints(this.startPoint, this.destinationPoint).subscribe(value => {
          this.route = value;
        })
      }
    }
  }
}
