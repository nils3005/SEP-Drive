import {Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {GeocodeFeature, RouteStopEventEmitterDto} from "../../types";
import {GeoService} from "../../services/geo/geo.service";
import {CarType} from "../../enums/car-type";
import {ErrorService} from "../../services/error/error.service";
import {LocationInputComponent} from '../core/location-input/location-input.component';
import {GeoStoreService} from '../../stores/geo/geo-store.service';
import {LocationStopInputComponent} from '../core/location-stop-input/location-stop-input.component';
import {RideRequestService} from '../../services/riderequest/ride-request.service';
import {firstValueFrom} from 'rxjs';
import {OpenRouteServiceService} from '../../services/openroute/open-route-service.service';

@Component({
  selector: 'app-route-input',
  imports: [
    ReactiveFormsModule,
    LocationInputComponent,
    LocationStopInputComponent,
  ],
  templateUrl: './route-input.component.html',
  styleUrl: './route-input.component.scss'
})
export class RouteInputComponent {

  public routeForm = new FormGroup({
    carType: new FormControl(""),
    stopOrder: new FormControl("1")
  })

  public showStopInput: boolean = false;

  constructor(
    private geoService: GeoService,
    private errorService: ErrorService,
    public geoStoreService: GeoStoreService,
    private rideRequestService: RideRequestService,
    private openRouteService: OpenRouteServiceService
  ) {
  }

  public carTypes= [
    {
      id: 1,
      value: CarType.SMALL
    },
    {
      id: 2,
      value: CarType.MEDIUM
    },
    {
      id: 3,
      value: CarType.DELUXE
    }
  ];

  onStartSelect(geocodeFeature: GeocodeFeature) {
    this.geoStoreService.start.next(geocodeFeature);
    this.geoStoreService.currentPoint.next(geocodeFeature);
  }

  onDestinationSelect(geocodeFeature: GeocodeFeature) {
    this.geoStoreService.destination.next(geocodeFeature);
    this.geoStoreService.currentPoint.next(geocodeFeature);
  }

  async onSubmit() {
    if (this.geoStoreService.start.getValue() && this.geoStoreService.destination.getValue() && this.routeForm.controls.carType.value) {
      this.geoStoreService.carType.next(this.routeForm.controls.carType.value)
      if (this.routeForm.controls.stopOrder.value == "0") {
        const start = this.geoStoreService.start.getValue();
        this.rideRequestService.getOptimizedStops([start!.geometry.coordinates[0], start!.geometry.coordinates[1]], this.geoService.getCoordinateArray(this.geoStoreService.stops.getValue())).subscribe({
          next: async result => {
            const cords = result.body
            if (cords) {
              let stops: GeocodeFeature[] = [];
              for (const stop of cords.optimizedWaypoints) {
                const stopResponse = await firstValueFrom(
                  this.openRouteService.getGeocodeFeatureByCoordinates({
                    longitude: stop.latitude,
                    latitude: stop.longitude
                  })
                )
                if (stopResponse.body) {
                  stops.push(stopResponse.body.features[0])
                }
              }
              this.geoStoreService.optimizedStops.next(stops)
              this.geoService.calculateRoute(true)
            }
          }
        })
      } else {
        this.geoService.calculateRoute()
      }
    } else {
      this.errorService.showError("Alle Felder müssen ausgefüllt sein")
    }
  }

  onStopChange($event: RouteStopEventEmitterDto) {
    this.geoStoreService.stops.next($event.stops);
    if (!$event.removed) {
      this.geoStoreService.currentPoint.next($event.changedStop);
    }
  }
}
