import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {Coordinates, GeocodeFeature} from '../../../types';
import {OpenRouteServiceService} from '../../../services/openroute/open-route-service.service';
import {ErrorService} from '../../../services/error/error.service';

@Component({
  selector: 'app-location-input',
    imports: [
        ReactiveFormsModule
    ],
  templateUrl: './location-input.component.html',
  styleUrl: './location-input.component.scss'
})
export class LocationInputComponent implements OnInit {
  @Input({required: true}) placeholder: string = ""
  @Input() location: GeocodeFeature | null = null;
  @Output() onLocationSelected = new EventEmitter<GeocodeFeature>()
  public useCoords: boolean = false;

  public suggestions: GeocodeFeature[] = [];
  public showSuggestions: boolean = false;
  private suppressSuggestions: boolean = false;

  public locationForm = new FormGroup({
    locationInput: new FormControl(""),
    latitudeInput: new FormControl(""),
    longitudeInput: new FormControl(""),
  })


  constructor(
    private openRouteService: OpenRouteServiceService,
    private errorService: ErrorService
  ) {
  }

  ngOnInit(): void {
    if (this.location) {
      this.suppressSuggestions = true;
      this.locationForm.controls.locationInput.setValue(this.location.properties.label);
    }

    this.locationForm.controls.locationInput.valueChanges.subscribe(value => {
      if (value && !this.suppressSuggestions) {
        this.openRouteService.getAutocompleteSuggestions(value).subscribe(addressAutocompleteSuggestions => {
          this.suggestions = addressAutocompleteSuggestions.features.slice(0, 5);
          this.showSuggestions = true;
        })
      } else {
        this.suppressSuggestions = false;
      }
    })
  }

  onBlur() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 100);
  }

  onFocus() {
    if (this.suggestions.length > 0) {
      this.showSuggestions = true;
    }
  }

  onSelect(suggestion: GeocodeFeature) {
    this.suppressSuggestions = true;
    this.locationForm.controls.locationInput.setValue(suggestion.properties.label);
    this.showSuggestions = false;
    this.onLocationSelected.emit(suggestion);
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const longitude = position.coords.longitude;
          const latitude = position.coords.latitude;
          this.openRouteService.getGeocodeFeatureByCoordinates({
            latitude: latitude,
            longitude: longitude
          }).subscribe({
            next: (response) => {
              if (response.body) {
                this.onSelect(response.body.features[0]);
              }
            },
            error: () => {
              this.errorService.showError("Position konnte nicht gefunden werden");
            }
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              this.errorService.showError("Standortberechtigung wurde verweigert.");
              break;
            case error.POSITION_UNAVAILABLE:
              this.errorService.showError("Standortinformationen sind nicht verfügbar.");
              break;
            case error.TIMEOUT:
              this.errorService.showError("Zeitüberschreitung beim Abrufen der Standortdaten.");
              break;
            default:
              this.errorService.showError("Unbekannter Fehler beim Abrufen der Standortdaten.");
              break;
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      this.errorService.showError("Geolocation wird von diesem Browser nicht unterstützt.");
    }
  }

  checkCoordinates() {
    if (this.locationForm.controls.latitudeInput.value && this.locationForm.controls.longitudeInput.value) {
      let coordinates: Coordinates = {
        latitude: this.locationForm.controls.latitudeInput.value,
        longitude: this.locationForm.controls.longitudeInput.value
      }
      this.openRouteService.getGeocodeFeatureByCoordinates(coordinates).subscribe({
        next: (response) => {
          if (response.body) {
            this.onLocationSelected.emit(response.body.features[0]);
          }
        },
        error: error => {
          this.errorService.showError("Position wurde nicht gefunden")
        }
      })
    } else {
      this.errorService.showError("Alle Felder müssen ausgefüllt sein")
    }
  }
}
