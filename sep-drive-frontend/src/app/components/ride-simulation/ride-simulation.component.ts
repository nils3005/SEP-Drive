import {Component, OnInit} from '@angular/core';
import {DataDisplayComponent} from '../core/data-display/data-display.component';
import {MapService} from '../../services/map/map.service';
import {RideService} from '../../services/ride/ride.service';
import {RideSimulationStore} from '../../stores/rideSimulation/ride-simulation-store.service';
import {Coordinates, Ride, RideResponse, RideUpdateDTO} from '../../types';
import {OpenRouteServiceService} from '../../services/openroute/open-route-service.service';
import {GeoService} from '../../services/geo/geo.service';
import {WebsocketService} from '../../services/websocket/web-socket.service';

@Component({
  selector: 'app-ride-simulation',
  imports: [DataDisplayComponent],
  templateUrl: './ride-simulation.component.html',
  styleUrl: './ride-simulation.component.scss',
})
export class RideSimulationComponent implements OnInit {
  public speedValue = 15;

  private speedChange: boolean = false;

  constructor(
    private mapService: MapService,
    private rideService: RideService,
    public rideSimulationStore: RideSimulationStore,
    private openRouteService: OpenRouteServiceService,
    private geoService: GeoService,
    private webSocketService: WebsocketService
    ) {
    this.webSocketService.isConnected.subscribe(isConnected => {
      if (isConnected) {
        console.log('Connected');
        this.webSocketService.subscribe<RideUpdateDTO>('/topic/ride/1').subscribe((data) => {
          if (this.rideSimulationStore.ride.getValue()?.ride.rideId === data.rideId) {
            this.rideSimulationStore.rideData.next(data);
          }
        })
      }
    })
  }

  ngOnInit(): void {
    this.mapService.clearMap()
    this.rideService.getActiveRide().subscribe((rideResponse: RideResponse) => {
      this.rideSimulationStore.ride.next(rideResponse);
      if (rideResponse.ride) {
        // console.log(rideResponse)
        this.rideSimulationStore.rideData.next({
          rideId: rideResponse.ride.rideId,
          paused: true,
          resuming: false,
          completed: false,
          speed: rideResponse.ride.speed,
          coordsIndex: rideResponse.ride.coordsIndex,
          historyId: null
        });
        const startCords: Coordinates = {
          latitude: rideResponse.coords[0][0],
          longitude: rideResponse.coords[0][1]
        }

        this.speedValue = rideResponse.ride.speed;
        this.openRouteService.getGeocodeFeatureByCoordinates(startCords).subscribe({
          next: data => {
            if (data.body) {
              this.rideSimulationStore.start.set(data.body.features[0].properties.label)
              this.geoService.updateStart(data.body.features[0], false)
              const endCords: Coordinates = {
                latitude: rideResponse.coords[rideResponse.coords.length - 1][0],
                longitude: rideResponse.coords[rideResponse.coords.length - 1][1]
              }
              this.openRouteService.getGeocodeFeatureByCoordinates(endCords).subscribe({
                next: data => {
                  if (data.body) {
                    this.rideSimulationStore.destination.set(data.body.features[0].properties.label)
                    this.geoService.updateDestination(data.body.features[0], false)
                    // console.log(JSON.parse(rideResponse.ride.geoJson))
                    this.geoService.route.next(JSON.parse(rideResponse.ride.geoJson))
                    this.rideService.simulateRide()
                  }
                }
              })
            }
          }
        });
      }
    });

    this.checkUpdates()
  }

  checkUpdates(): void
  {
    this.rideSimulationStore.rideData.asObservable().subscribe((rideData) => {
      // console.log(rideData);
      if (rideData.paused && this.rideSimulationStore.motionPolyLine) {
        this.rideSimulationStore.motionPolyLine.motionPause()
      }
      if (rideData.resuming && this.rideSimulationStore.motionPolyLine) {
        // console.log("starting")
        if (!this.rideSimulationStore.started) {
          // console.log("starting 2")
          this.rideSimulationStore.motionPolyLine.motionStart()
          this.rideSimulationStore.started = true;
        } else {
          this.rideSimulationStore.motionPolyLine.motionResume()
        }
      }
      if (this.speedChange) {
        const ride = this.rideSimulationStore.ride.getValue();
        if (this.rideSimulationStore.motionPolyLine && ride) {
          // console.log(ride.ride.distance)
          // console.log(rideData.speed)
          const speed = this.rideService.calculateKmh(ride.ride.distance, rideData.speed)
          this.rideSimulationStore.motionPolyLine.motionSpeed(speed)
          this.speedChange = false;
        }
      }
    })
  }

  onSpeedBlur() {
    // console.log('Speed input changed:', this.speedValue);
    let rideData = this.rideSimulationStore.rideData.getValue();
    rideData.speed = this.speedValue;
    this.speedChange = true;
    this.rideSimulationStore.rideData.next(rideData);
    this.rideService.updateRide()
    // console.log(this.rideSimulationStore.rideData.getValue())
  }

  onSpeedChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.speedValue = Number(input.value);
  }

  getPercentage(value: number, min: number, max: number): number {
    return ((value - min) / (max - min)) * 100;
  }

  toggleRideStatus() {
    let rideData = this.rideSimulationStore.rideData.getValue();
    rideData.paused = !rideData.paused;
    rideData.resuming = !rideData.resuming;
    this.rideSimulationStore.rideData.next(rideData);
    this.rideService.updateRide()
  }
}
