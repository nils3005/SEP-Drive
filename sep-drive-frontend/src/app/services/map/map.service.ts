import { Injectable } from '@angular/core';
import {GeoService} from '../geo/geo.service';
import {RideSimulationStore} from '../../stores/rideSimulation/ride-simulation-store.service';
import {GeoStoreService} from '../../stores/geo/geo-store.service';
import {GeoJsonRoute, RideUpdateDTO} from '../../types';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(
    private geoService: GeoService,
    private rideSimulationStore: RideSimulationStore,
    private geoStoreService: GeoStoreService,
  ) { }


  public flyMapTo(latitude: number, longitude: number, zoom: number, duration: number): void
  {
    this.geoStoreService.map?.flyTo([latitude, longitude],
      zoom,
      {
        duration: duration
      }
    )
  }

  public resetMap(): void
  {
    this.geoService.showInput.next(true)
    this.geoStoreService.start.next(null)
    this.geoStoreService.stops.next([])
    this.geoStoreService.destination.next(null)
    this.geoStoreService.route.next(undefined)
    this.geoStoreService.carType.next(null)
    this.geoStoreService.currentPoint.next(null)
    this.flyMapTo(51.1657, 10.4515, 6, 1)
  }

  public clearMap(): void
  {
    this.geoStoreService.start.next(null)
    this.geoStoreService.stops.next([])
    this.geoStoreService.destination.next(null)
    this.geoStoreService.route.next(undefined)
    this.geoStoreService.carType.next(null)
    this.rideSimulationStore.simulationLayer.clearLayers()
    this.flyMapTo(51.1657, 10.4515, 6, 1)
  }

  public updateRoute(rideData: RideUpdateDTO): void
  {
    // this.rideSimulationStore.simulationLayer.removeLayer(this.rideSimulationStore.motionPolyLine)
    this.geoStoreService.route.next(JSON.parse(rideData.geoJson));
    const jsonRoute: GeoJsonRoute = JSON.parse(rideData.geoJson);
    let ride = this.rideSimulationStore.ride.getValue()
    if (ride) {
      ride.coords = jsonRoute.features[0].geometry.coordinates;
      this.rideSimulationStore.ride.next(ride)
    }
    location.reload()
  }
}
