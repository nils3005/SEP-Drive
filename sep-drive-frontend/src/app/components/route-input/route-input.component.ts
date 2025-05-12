import {Component, inject, Output} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {OpenRouteServiceService} from "../../services/open-route-service.service";
import {AddressAutocompleteSuggestion, Coordinates, GeocodeFeature, RideRequestSummary} from "../../types";
import {GeoService} from "../../services/geo.service";
import {CarType} from "../../enums/car-type";
import {RideRequestService} from "../../services/ride-request.service";
import {Observable} from "rxjs";

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

  constructor(private geoService: GeoService, private rideRequestService: RideRequestService) {
    this.checkChanges()
  }

  public useStartCoordinates = false;
  public useDestinationCoordinates = false;

  public showError = false;
  public errorMessage: string | undefined;

  public routeForm = new FormGroup({
    start: new FormControl(""),
    destination: new FormControl(""),
    carType: new FormControl(""),
    startCordLat: new FormControl(""),
    startCordLon: new FormControl(""),
    endCordLat: new FormControl(""),
    endCordLon: new FormControl(""),
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
      this.showError = false;
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
      this.showError = false;
      if (value && !this.startSuppressAutocomplete) {
        this.openRouteServiceService.getAutocompleteSuggestions(value).subscribe(addressAutocompleteSuggestions => {
          this.startSuggestions = addressAutocompleteSuggestions.features.slice(0, 5);
          this.startShowSuggestions = true;
        })
      } else {
        this.startSuppressAutocomplete = false;
      }
    })

    this.routeForm.controls.startCordLat.valueChanges.subscribe(value => {
      this.showError = false;
    })
    this.routeForm.controls.startCordLon.valueChanges.subscribe(value => {
      this.showError = false;
    })

    this.routeForm.controls.endCordLat.valueChanges.subscribe(value => {
      this.showError = false;
    })
    this.routeForm.controls.endCordLon.valueChanges.subscribe(value => {
      this.showError = false;
    })

    this.routeForm.controls.carType.valueChanges.subscribe(value => {
      this.showError = false;
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
      navigator.geolocation.getCurrentPosition((position) => {
        const longitude = position.coords.longitude;
        const latitude = position.coords.latitude;
        this.openRouteServiceService.getGeocodeFeatureByCoordinates({
          latitude: latitude,
          longitude: longitude
        }).subscribe((features: AddressAutocompleteSuggestion) => {
          this.onStartSelect(features.features[0]);
        })
      })
    }
  }

  checkCoordinates(source: number) {
    if (source == 0) {
      if (this.routeForm.controls.startCordLat.value && this.routeForm.controls.startCordLon.value) {
        let coordinates: Coordinates = {
          latitude: this.routeForm.controls.startCordLat.value,
          longitude: this.routeForm.controls.startCordLon.value
        }
        this.openRouteServiceService.getGeocodeFeatureByCoordinates(coordinates).subscribe(features => {
          this.geoService.updateStart(features.features[0]);
          this.geoService.currentPoint.next(features.features[0]);
        })
      } else {
        this.errorMessage = "Alle Felder müssen ausgefüllt werden"
        this.showError = true;
      }
    } else if (source > 0) {
      if (this.routeForm.controls.endCordLat.value && this.routeForm.controls.endCordLon.value) {
        let coordinates: Coordinates = {
          latitude: this.routeForm.controls.endCordLat.value,
          longitude: this.routeForm.controls.endCordLon.value
        }
        this.openRouteServiceService.getGeocodeFeatureByCoordinates(coordinates).subscribe(features => {
          this.geoService.updateDestination(features.features[0]);
          this.geoService.currentPoint.next(features.features[0]);
        })
      } else {
        this.errorMessage = "Alle Felder müssen ausgefüllt werden"
        this.showError = true;
      }
    }
  }

  onSubmit() {
    if (this.geoService.waypoints.getValue()[0] && this.geoService.waypoints.getValue()[1] && this.routeForm.controls.carType.value) {
      this.geoService.carType.next(this.routeForm.controls.carType.value)
      this.geoService.calculateRoute()
    } else {
      this.errorMessage = "Alle Felder müssen ausgefüllt werden"
      this.showError = true;
    }
  }
}
