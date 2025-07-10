import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataDisplayComponent} from '../core/data-display/data-display.component';
import {MapService} from '../../services/map/map.service';
import {RideService} from '../../services/ride/ride.service';
import {RideSimulationStore} from '../../stores/rideSimulation/ride-simulation-store.service';
import {
  Coordinates,
  GeocodeFeature,
  GeoJsonRoute,
  Ride,
  RideRequestSummary,
  RideUpdateDTO,
  RouteStopEventEmitterDto
} from '../../types';
import {OpenRouteServiceService} from '../../services/openroute/open-route-service.service';
import {WebsocketService} from '../../services/websocket/web-socket.service';
import {Router} from '@angular/router';
import {BehaviorSubject, firstValueFrom} from 'rxjs';
import {GeoStoreService} from '../../stores/geo/geo-store.service';
import {LocationInputComponent} from '../core/location-input/location-input.component';
import {LocationStopInputComponent} from '../core/location-stop-input/location-stop-input.component';
import {GeoService} from '../../services/geo/geo.service';

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
    private openRouteService: OpenRouteServiceService,
    public geoStoreService: GeoStoreService,
    private webSocketService: WebsocketService,
    private router: Router,
    private geoService: GeoService
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

  async ngOnInit() {
    this.mapService.clearMap()
    this.rideService.getActiveRide()
      .subscribe({
        next: async rideResponse => {
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
            console.log(rideResponse)
            if (rideResponse.ride.coordsIndex > 0) {
              this.rideSimulationStore.started = true;
            }
            const startCords: Coordinates = {
              latitude: rideResponse.ride.startLocation.latitude,
              longitude: rideResponse.ride.startLocation.longitude,
            }
            const endCords: Coordinates = {
              latitude: rideResponse.ride.destination.latitude,
              longitude: rideResponse.ride.destination.longitude
            }

            let stops: GeocodeFeature[] = [];

            for (const stop of rideResponse.ride.waypoints) {
              const stopResponse = await firstValueFrom(
                this.openRouteService.getGeocodeFeatureByCoordinates({
                  longitude: stop.longitude,
                  latitude: stop.latitude
                })
              )
              if (stopResponse.body) {
                stops.push(stopResponse.body.features[0])
              }
            }

            this.geoStoreService.stops.next(stops);

            this.speedValue = rideResponse.ride.speed;
            this.openRouteService.getGeocodeFeatureByCoordinates(startCords).subscribe({
              next: data => {
                if (data.body) {
                  this.geoStoreService.start.next(data.body.features[0])
                  const endCords: Coordinates = {
                    latitude: rideResponse.coords[rideResponse.coords.length - 1][0],
                    longitude: rideResponse.coords[rideResponse.coords.length - 1][1]
                  }
                  this.openRouteService.getGeocodeFeatureByCoordinates(endCords).subscribe({
                    next: data => {
                      if (data.body) {
                        this.geoStoreService.destination.next(data.body.features[0])
                        this.geoStoreService.route.next(JSON.parse(rideResponse.ride.geoJson))
                        this.rideData.next(this.getRideSummaryFromRide(rideResponse.ride, this.rideSimulationStore.start()?.properties.label ?? '', this.rideSimulationStore.destination()?.properties.label ?? ''))
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

      if (rideData.geoJson != this.geoStoreService.route.getValue() && rideData.geoJson) {
        this.geoStoreService.route.next(JSON.parse(rideData.geoJson));
        const jsonRoute: GeoJsonRoute = JSON.parse(rideData.geoJson);
        let ride = this.rideSimulationStore.ride.getValue()
        if (ride) {
          ride.coords = jsonRoute.features[0].geometry.coordinates;
          this.rideSimulationStore.ride.next(ride)
        }
      }

      if (rideData.waypoints) {
        let features: GeocodeFeature[] = []
        for (const point of rideData.waypoints) {
          this.openRouteService.getGeocodeFeatureByCoordinates(point).subscribe({
            next: data => {
              if (data.body) {
                features.push(data.body.features[0]);
              }
            }
          })
        }
        this.geoStoreService.stops.next(features)
      }

      if (rideData.destination != this.geoService.getCoordinatesByGeoCodeFeature(this.geoStoreService.destination.getValue()!) && rideData.destination) {
        this.openRouteService.getGeocodeFeatureByCoordinates({
          latitude: rideData.destination.longitude,
          longitude: rideData.destination.latitude,
        }).subscribe({
          next: data => {
            if (data.body) {
              console.log("Updating Destination: ", data.body.features[0]);
              this.geoStoreService.destination.next(data.body.features[0])
            }
          }
        })
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

  onDestinationChange(event: GeocodeFeature) {
    this.geoStoreService.destination.next(event);
    // this.rideService.addMarkerPositionToWaypointArray(passedWaypoints).then(stops => {
    //   stops.push(event);
    //   const coordinates = this.rideService.getCoordsArrayFromGeocodeFeatureArray(stops)
    // })
    const ride = this.rideSimulationStore.ride.getValue();
    const start = this.geoStoreService.start.getValue();
    if (ride && start) {
      let cords = this.rideService.mergePastRouteAndFutureWaypoints(ride, this.geoStoreService.stops.getValue())
      cords.splice(0, 0, [start.geometry.coordinates[0], start.geometry.coordinates[1]]);
      cords.push([event.geometry.coordinates[0], event.geometry.coordinates[1]]);
      this.openRouteService.getRouteFromPointArray(
        cords
      ).subscribe({
        next: data => {
          this.rideService.editRideData(
            10,
            10,
            event,
            null,
            data.body
          )
        }
      })
    }
  }

  onStopChange(event: RouteStopEventEmitterDto) {
    if (event.removed) {
      this.geoStoreService.stops.next(event.stops);
      const ride = this.rideSimulationStore.ride.getValue();
      const start = this.geoStoreService.start.getValue();
      const destination = this.geoStoreService.destination.getValue();
      if (ride && start && destination) {
        let cords = this.rideService.mergePastRouteAndFutureWaypoints(ride, this.geoStoreService.stops.getValue())
        cords.splice(0, 0, [start.geometry.coordinates[0], start.geometry.coordinates[1]]);
        cords.push([destination.geometry.coordinates[0], destination.geometry.coordinates[1]]);
        this.openRouteService.getRouteFromPointArray(
          cords
        ).subscribe({
          next: data => {
            this.rideService.editRideData(
              10,
              10,
              null,
              event.stops,
              data.body
            )
          }
        })
      }
    }
  }
}
