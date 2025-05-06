import {Component, EventEmitter, inject, Output} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {OpenRouteServiceService} from "../../services/open-route-service.service";
import {AddressAutocompleteSuggestion, GeocodeFeature} from "../../types";

@Component({
  selector: 'app-route-input',
  imports: [
    ReactiveFormsModule,

  ],
  templateUrl: './route-input.component.html',
  styleUrl: './route-input.component.scss'
})
export class RouteInputComponent {
  public routeForm = new FormGroup({
    start: new FormControl(""),
    destination: new FormControl(""),
    carType: new FormControl("")
  })

  private openRouteServiceService = inject(OpenRouteServiceService);
  @Output() start = new EventEmitter<GeocodeFeature>();
  @Output() destination = new EventEmitter<GeocodeFeature>();
  @Output() submitEvent = new EventEmitter();

  public carTypes= [
    {
      id: 1,
      value: "standard"
    },
    {
      id: 2,
      value: "medium"
    },
    {
      id: 3,
      value: "deluxe"
    }
  ];


  constructor() {
    this.onStartChanges();
    this.onDestinationChanges()
  }

  // Logic for start suggestions
  public startSuggestions: GeocodeFeature[] = [];
  public startShowSuggestions: boolean = false;
  public startSuppressAutocomplete: boolean = false;

  onStartChanges() {
    this.routeForm.get('start')?.valueChanges.subscribe(value => {
        if (value && !this.startSuppressAutocomplete) {
          this.openRouteServiceService.getAutocompleteSuggestions(value).subscribe(addressAutocompleteSuggestions => {
            this.startSuggestions = addressAutocompleteSuggestions.features.slice(0, 5);
            this.startShowSuggestions = true;
          })
        } else {
          this.startSuppressAutocomplete = false;
        }
      }
    )
  }

  onStartSelect(geocodeFeature: GeocodeFeature) {
    this.start.emit(geocodeFeature);
    this.startSuppressAutocomplete = true;
    this.routeForm.controls.start.setValue(geocodeFeature.properties.label)
    this.startSuggestions = [];
    this.startShowSuggestions = false;
  }

  onStartBlur() {
    setTimeout(() => {
      this.startShowSuggestions = false;
    }, 100);
  }

  onStartFocus() {
    if (this.startSuggestions.length > 0) {
      this.startShowSuggestions = true;
    }
  }

  // Logic for destination suggestions

  public destinationSuggestions: GeocodeFeature[] = [];
  public destinationShowSuggestions: boolean = false;
  public destinationSuppressAutocomplete: boolean = false;

  onDestinationChanges() {
    this.routeForm.get('destination')?.valueChanges.subscribe(value => {
          if (value && !this.destinationSuppressAutocomplete) {
            this.openRouteServiceService.getAutocompleteSuggestions(value).subscribe(addressAutocompleteSuggestions => {
              this.destinationSuggestions = addressAutocompleteSuggestions.features.slice(0, 5);
              this.destinationShowSuggestions = true;
            })
          } else {
            this.destinationSuppressAutocomplete = false;
          }
        }
    )
  }

  onDestinationSelect(geocodeFeature: GeocodeFeature) {
    this.destination.emit(geocodeFeature);
    this.destinationSuppressAutocomplete = true;
    this.routeForm.controls.destination.setValue(geocodeFeature.properties.label)
    this.destinationSuggestions = [];
    this.destinationShowSuggestions = false;
  }

  onDestinationBlur() {
    setTimeout(() => {
      this.destinationShowSuggestions = false;
    }, 100);
  }

  onDestinationFocus() {
    if (this.destinationSuggestions.length > 0) {
      this.destinationShowSuggestions = true;
    }
  }

  onSubmit() {
    this.submitEvent.emit();
  }
}
