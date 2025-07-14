import {Component, EventEmitter, Input, Output} from '@angular/core';
import {LocationInputComponent} from '../location-input/location-input.component';
import {GeocodeFeature, RouteStopEventEmitterDto} from '../../../types';
import {GeoStoreService} from '../../../stores/geo/geo-store.service';
import {RideSimulationStore} from '../../../stores/rideSimulation/ride-simulation-store.service';
import {ErrorService} from '../../../services/error/error.service';

@Component({
  selector: 'app-location-stop-input',
  imports: [
    LocationInputComponent
  ],
  templateUrl: './location-stop-input.component.html',
  styleUrl: './location-stop-input.component.scss'
})
export class LocationStopInputComponent {
  @Output() onStopsChange: EventEmitter<RouteStopEventEmitterDto> = new EventEmitter();

  stops: GeocodeFeature[] = [];

  constructor(
    private geoStoreService: GeoStoreService,
    private rideSimulationStore: RideSimulationStore,
    private errorService: ErrorService
  ) {
    this.stops = this.geoStoreService.stops.getValue();
  }


  public inputLocation: GeocodeFeature | null = null;
  // public stops: GeocodeFeature[] = [];

  addStop($event: GeocodeFeature) {
    this.stops.push($event);
    this.inputLocation = null
    this.onStopsChange.emit({
      stops: this.stops,
      changedStop: $event,
      removed: false
    });
  }

  removeStop($event: GeocodeFeature) {
    if (this.rideSimulationStore.passedWaypoints.includes($event.properties.id.split('/')[1])) {
      this.errorService.showError("Stop wurde bereits angefahren")
      return
    }
    this.stops.splice(this.stops.indexOf($event), 1);
    this.onStopsChange.emit({
      stops: this.stops,
      changedStop: $event,
      removed: true
    });
  }
}
