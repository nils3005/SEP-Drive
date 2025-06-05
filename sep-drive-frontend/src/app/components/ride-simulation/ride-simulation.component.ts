import {AfterViewInit, Component, OnInit} from '@angular/core';
import {DataDisplayComponent} from '../core/data-display/data-display.component';
import {MapService} from '../../services/map/map.service';
import {RideService} from '../../services/ride/ride.service';
import {RideSimulationStore} from '../../stores/rideSimulation/ride-simulation-store.service';
import {Ride} from '../../types';
import {OpenRouteServiceService} from '../../services/openroute/open-route-service.service';
import {GeoService} from '../../services/geo/geo.service';

@Component({
  selector: 'app-ride-simulation',
  imports: [DataDisplayComponent],
  templateUrl: './ride-simulation.component.html',
  styleUrl: './ride-simulation.component.scss',
})
export class RideSimulationComponent implements AfterViewInit {
  public speedValue = 15;

  constructor(
    private mapService: MapService,
    private rideService: RideService,
    public rideSimulationStore: RideSimulationStore,
    private openRouteService: OpenRouteServiceService,
    private geoService: GeoService
    ) {
  }

  ngAfterViewInit(): void {
    this.mapService.clearMap()
    this.rideService.getActiveRide().subscribe((ride: Ride | null) => {
      this.rideSimulationStore.ride.next(ride);
      if (ride) {
        this.openRouteService.getGeocodeFeatureByCoordinates(ride.start).subscribe({
          next: data => {
            if (data.body) {
              this.rideSimulationStore.start.set(data.body.features[0].properties.label)
              this.geoService.updateStart(data.body.features[0])
            }
          }
        });
        this.openRouteService.getGeocodeFeatureByCoordinates(ride.end).subscribe({
          next: data => {
            if (data.body) {
              this.rideSimulationStore.destination.set(data.body.features[0].properties.label)
              this.geoService.updateDestination(data.body.features[0])
            }
          }
        })
        this.openRouteService.getRouteFromPointArray([[12, 50], [10, 50]]).subscribe(
          route => {
            if (route) {
              this.geoService.route.next(route.body);
            }
          }
        )
      }
    });
  }

  onSpeedBlur() {
    console.log('Speed input changed:', this.speedValue);
  }

  onSpeedChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.speedValue = Number(input.value);
  }

  getPercentage(value: number, min: number, max: number): number {
    return ((value - min) / (max - min)) * 100;
  }
}
