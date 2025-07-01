import {Component, EventEmitter, Output} from '@angular/core';
import {LocationInputComponent} from '../location-input/location-input.component';
import {GeocodeFeature} from '../../../types';

@Component({
  selector: 'app-location-stop-input',
  imports: [
    LocationInputComponent
  ],
  templateUrl: './location-stop-input.component.html',
  styleUrl: './location-stop-input.component.scss'
})
export class LocationStopInputComponent {
  @Output() onStopsChange: EventEmitter<GeocodeFeature[]> = new EventEmitter();

  public inputLocation: GeocodeFeature | null = null;
  public stops: GeocodeFeature[] = [];

  addStop($event: GeocodeFeature) {
    this.stops.push($event);
    this.inputLocation = null
    this.onStopsChange.emit(this.stops);
  }

  removeStop($event: GeocodeFeature) {
    this.stops.splice(this.stops.indexOf($event), 1);
    this.onStopsChange.emit(this.stops);
  }
}
