import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {OpenRouteServiceService} from "../../services/openroute/open-route-service.service";
import {AddressAutocompleteSuggestion, Coordinates, GeocodeFeature} from "../../types";
import {GeoService} from "../../services/geo/geo.service";
import {CarType} from "../../enums/car-type";
import {ErrorService} from "../../services/error/error.service";

@Component({
  selector: 'app-route-input',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './route-input.component.html',
  styleUrl: './route-input.component.scss'
})
export class RouteInputComponent {
  private openRouteServiceService = inject(OpenRouteServiceService);

  constructor(private geoService: GeoService, private errorService: ErrorService) {
    this.checkChanges()
  }

  public useStartCoordinates = false;
  public useDestinationCoordinates = false;
  public useStopCoordinates = false;
  public checkedStopCords = false;

  public showStopInput = false
  public stops: GeocodeFeature[] = [];

  public routeForm = new FormGroup({
    start: new FormControl(""),
    destination: new FormControl(""),
    carType: new FormControl(""),
    startCordLat: new FormControl(""),
    startCordLon: new FormControl(""),
    endCordLat: new FormControl(""),
    endCordLon: new FormControl(""),
    stop: new FormControl(""),
    stopCordLat: new FormControl(""),
    stopCordLon: new FormControl(""),
  })

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

  checkChanges () {
    this.routeForm.controls.destination.valueChanges.subscribe(value => {
      if (value && !this.destinationSuppressAutocomplete) {
        this.openRouteServiceService.getAutocompleteSuggestions(value).subscribe(addressAutocompleteSuggestions => {
          this.destinationSuggestions = addressAutocompleteSuggestions.features.slice(0, 5);
          this.destinationShowSuggestions = true;
        })
      } else {
        this.destinationSuppressAutocomplete = false;
      }
    })

    this.routeForm.controls.start.valueChanges.subscribe(value => {
      if (value && !this.startSuppressAutocomplete) {
        this.openRouteServiceService.getAutocompleteSuggestions(value).subscribe(addressAutocompleteSuggestions => {
          this.startSuggestions = addressAutocompleteSuggestions.features.slice(0, 5);
          this.startShowSuggestions = true;
        })
      } else {
        this.startSuppressAutocomplete = false;
      }
    })

    this.routeForm.controls.stop.valueChanges.subscribe(value => {
      if (value && !this.stopSuppressAutocomplete) {
        this.openRouteServiceService.getAutocompleteSuggestions(value).subscribe(addressAutocompleteSuggestions => {
          this.stopSuggestions = addressAutocompleteSuggestions.features.slice(0, 5);
          this.stopShowSuggestions = true;
        })
      } else {
        this.stopSuppressAutocomplete = false;
      }
    })
  }

  // Logic for start suggestions
  public startSuggestions: GeocodeFeature[] = [];
  public startShowSuggestions: boolean = false;
  public startSuppressAutocomplete: boolean = false;

  onStartSelect(geocodeFeature: GeocodeFeature) {
    this.geoService.updateStart(geocodeFeature);
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

  // Logic for stop suggestions
  public stopSuggestions: GeocodeFeature[] = [];
  public stopShowSuggestions: boolean = false;
  public stopSuppressAutocomplete: boolean = false;

  onStopSelect(geocodeFeature: GeocodeFeature) {
    this.geoService.addStop(geocodeFeature);
    this.stops.push(geocodeFeature);
    this.stopSuppressAutocomplete = true;
    this.routeForm.controls.stop.setValue(geocodeFeature.properties.label)
    this.stopSuggestions = [];
    this.stopShowSuggestions = false;
  }

  onStopBlur() {
    setTimeout(() => {
      this.stopShowSuggestions = false;
    }, 100);
  }

  onStopFocus() {
    if (this.stopSuggestions.length > 0) {
      this.stopShowSuggestions = true;
    }
  }

  // Logic for destination suggestions
  public destinationSuggestions: GeocodeFeature[] = [];
  public destinationShowSuggestions: boolean = false;
  public destinationSuppressAutocomplete: boolean = false;

  onDestinationSelect(geocodeFeature: GeocodeFeature) {
    this.geoService.updateDestination(geocodeFeature);
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

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
            const longitude = position.coords.longitude;
            const latitude = position.coords.latitude;
            this.openRouteServiceService.getGeocodeFeatureByCoordinates({
              latitude: latitude,
              longitude: longitude
            }).subscribe({
              next: (response) => {
                if (response.body) {
                  this.onStartSelect(response.body.features[0]);
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

  checkCoordinates(source: number) {
    if (source == 0) {
      if (this.routeForm.controls.startCordLat.value && this.routeForm.controls.startCordLon.value) {
        let coordinates: Coordinates = {
          latitude: this.routeForm.controls.startCordLat.value,
          longitude: this.routeForm.controls.startCordLon.value
        }
        this.openRouteServiceService.getGeocodeFeatureByCoordinates(coordinates).subscribe({
          next: (response) => {
            if (response.body) {
              this.geoService.updateStart(response.body.features[0]);
              this.geoService.currentPoint.next(response.body.features[0]);
            }
          },
          error: error => {
            this.errorService.showError("Position konnte nicht gefunden")
          }
        })
      } else {
        this.errorService.showError("Alle Felder müssen ausgefüllt sein")
      }
    } else if (source > 0) {
      if (this.routeForm.controls.endCordLat.value && this.routeForm.controls.endCordLon.value) {
        let coordinates: Coordinates = {
          latitude: this.routeForm.controls.endCordLat.value,
          longitude: this.routeForm.controls.endCordLon.value
        }
        this.openRouteServiceService.getGeocodeFeatureByCoordinates(coordinates).subscribe({
          next: (response) => {
            if (response.body) {
              this.geoService.updateDestination(response.body.features[0]);
              this.geoService.currentPoint.next(response.body.features[0]);
            }
          },
          error: error => {
            this.errorService.showError("Position konnte nicht gefunden")
          }
        })
      } else {
        this.errorService.showError("Alle Felder müssen ausgefüllt sein")
      }
    }
  }

  onSubmit() {
    if (this.geoService.waypoints.getValue()[0] && this.geoService.waypoints.getValue()[1] && this.routeForm.controls.carType.value) {
      this.geoService.carType.next(this.routeForm.controls.carType.value)
      this.geoService.calculateRoute()
    } else {
      this.errorService.showError("Alle Felder müssen ausgefüllt sein")
    }
  }
}
