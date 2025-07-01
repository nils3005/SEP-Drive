import {Component, EventEmitter, Output} from '@angular/core';
import {LocationInputComponent} from '../location-input/location-input.component';
import {GeocodeFeature, RouteStopEventEmitterDto} from '../../../types';

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

  public inputLocation: GeocodeFeature | null = null;
  public stops: GeocodeFeature[] = [];

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
    this.stops.splice(this.stops.indexOf($event), 1);
    this.onStopsChange.emit({
      stops: this.stops,
      changedStop: $event,
      removed: true
    });
  }
}
