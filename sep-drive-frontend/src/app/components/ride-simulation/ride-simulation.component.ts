import {Component, OnDestroy, OnInit, Signal} from '@angular/core';
import {DataDisplayComponent} from '../core/data-display/data-display.component';
import {MapService} from '../../services/map/map.service';
import {RideService} from '../../services/ride/ride.service';
import {RideSimulationStore} from '../../stores/rideSimulation/ride-simulation-store.service';
import {Coordinates, Ride, RideRequestSummary, RideResponse, RideUpdateDTO} from '../../types';
import {OpenRouteServiceService} from '../../services/openroute/open-route-service.service';
import {GeoService} from '../../services/geo/geo.service';
import {WebsocketService} from '../../services/websocket/web-socket.service';
import {Router} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {RideRequestService} from '../../services/riderequest/ride-request.service';
import {BehaviorSubject} from 'rxjs';
import {GeoStoreService} from '../../stores/geo/geo-store.service';
import {LocationInputComponent} from '../core/location-input/location-input.component';
import {LocationStopInputComponent} from '../core/location-stop-input/location-stop-input.component';

@Component({
  selector: 'app-ride-simulation',
  imports: [DataDisplayComponent, LocationInputComponent, LocationStopInputComponent],
  templateUrl: './ride-simulation.component.html',
  styleUrl: './ride-simulation.component.scss',
})
export class RideSimulationComponent implements OnInit, OnDestroy {
  public speedValue = 15;

  private started: number = 0;

  public rideData: BehaviorSubject<RideRequestSummary | null> = new BehaviorSubject<RideRequestSummary | null>(null);
  public showStopInput: boolean = false;

  constructor(
    private mapService: MapService,
    private rideService: RideService,
    public rideSimulationStore: RideSimulationStore,
    private rideRequestService: RideRequestService,
    private openRouteService: OpenRouteServiceService,
    private geoService: GeoService,
    private geoStoreService: GeoStoreService,
    private webSocketService: WebsocketService,
    private router: Router
    ) {
    this.webSocketService.isConnected.subscribe(isConnected => {
      if (isConnected) {
        this.rideSimulationStore.ride.asObservable().subscribe((ride) => {
          if (ride) {
            this.webSocketService.subscribe<RideUpdateDTO>('/topic/ride/' + ride.ride.rideId).subscribe((data) => {
              if (ride.ride.rideId === data.rideId) {
                console.log("historyId aus Websocket: ", data.historyId)
                this.rideSimulationStore.rideData.next(data);
                this.speedValue = data.speed;
              }
            })
          }
        })
      }
    })
  }

  ngOnDestroy(): void {
    this.rideSimulationStore.started = false;
  }

  ngOnInit(): void {
    this.mapService.clearMap()
    this.rideService.getActiveRide()
      .subscribe({
        next: rideResponse => {
          this.rideSimulationStore.ride.next(rideResponse);
          if (rideResponse.ride) {
            this.rideSimulationStore.rideData.next({
              rideId: rideResponse.ride.rideId,
              paused: true,
              resuming: false,
              completed: false,
              speed: rideResponse.ride.speed,
              coordsIndex: rideResponse.ride.coordsIndex,
              historyId: null
            });
            if (rideResponse.ride.coordsIndex > 0) {
              this.rideSimulationStore.started = true;
            }
            const startCords: Coordinates = {
              latitude: rideResponse.coords[0][0],
              longitude: rideResponse.coords[0][1]
            }
            this.speedValue = rideResponse.ride.speed;
            this.openRouteService.getGeocodeFeatureByCoordinates(startCords).subscribe({
              next: data => {
                if (data.body) {
                  this.rideSimulationStore.start.set(data.body.features[0].properties.label)
                  // this.geoService.updateStart(data.body.features[0], false)
                  const endCords: Coordinates = {
                    latitude: rideResponse.coords[rideResponse.coords.length - 1][0],
                    longitude: rideResponse.coords[rideResponse.coords.length - 1][1]
                  }
                  this.openRouteService.getGeocodeFeatureByCoordinates(endCords).subscribe({
                    next: data => {
                      if (data.body) {
                        this.rideSimulationStore.destination.set(data.body.features[0].properties.label)
                        // this.geoService.updateDestination(data.body.features[0], false)
                        this.geoStoreService.route.next(JSON.parse(rideResponse.ride.geoJson))
                        this.rideData.next(this.getRideSummaryFromRide(rideResponse.ride, this.rideSimulationStore.start(), this.rideSimulationStore.destination()))
                        this.started = 0;
                        this.rideService.simulateRide()
                        this.checkUpdates()
                      }
                    }
                  })
                }
              }
            });
          }
        },
        error: error => {
            this.router.navigate(['/'])
        }
    });
    setInterval(() => {
      // send update
      if (!this.rideSimulationStore.rideData.getValue().completed) {
        this.rideService.updateIndex()
      }
    }, 200);
  }

  checkUpdates(): void
  {
    this.rideSimulationStore.rideData.asObservable().subscribe((rideData) => {
      console.log("Update");
      if (rideData.paused && this.rideSimulationStore.motionPolyLine) {
        // this.rideSimulationStore.motionPolyLine.motionToggle();
        this.rideSimulationStore.motionPolyLine.motionPause()
      }
      if (rideData.resuming && this.rideSimulationStore.motionPolyLine) {
        if (this.started === 0) {
          this.rideSimulationStore.motionPolyLine.motionStart();
          this.rideSimulationStore.started = true
        } else {
          this.rideSimulationStore.motionPolyLine.motionResume();
        }
        this.started += 1;
      }
      if (this.started > 1) {
        const ride = this.rideSimulationStore.ride.getValue();
        if (this.rideSimulationStore.motionPolyLine && ride) {
          const speed = this.rideService.calculateKmh(ride.ride.distance, rideData.speed)
          this.rideSimulationStore.motionPolyLine.motionSpeed(speed)
        }
      }
    })
  }

  getRideSummaryFromRide(ride: Ride, start: string, end: string): RideRequestSummary
  {
    console.log(ride)
    return {
      start: start,
      waypoints: [],
      end: end,
      distance: parseFloat((ride.distance / 1000).toFixed(2)),
      duration: parseFloat((ride.duration / 60).toFixed(2)),
      price: parseFloat(ride.price.toFixed(2)),
      carType: ""
    }
  }

  onSpeedBlur() {
    this.rideService.updateRideData(null, null, this.speedValue, null)
  }

  onSpeedChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.speedValue = Number(input.value);
  }

  getPercentage(value: number, min: number, max: number): number {
    return ((value - min) / (max - min)) * 100;
  }

  toggleRideStatus() {
    // console.log("Button press")
    this.rideSimulationStore.motionPolyLine.motionToggle();
    this.rideSimulationStore.started = true;
    let rideData = this.rideSimulationStore.rideData.getValue();
    this.rideService.updateRideData(!rideData.paused, !rideData.resuming, null, null);
  }
}
