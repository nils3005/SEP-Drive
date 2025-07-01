import { Injectable } from '@angular/core';
import {GeoService} from '../geo/geo.service';
import {RideSimulationStore} from '../../stores/rideSimulation/ride-simulation-store.service';
import {GeoStoreService} from '../../stores/geo/geo-store.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(
    private geoService: GeoService,
    private rideSimulationStore: RideSimulationStore,
    private geoStoreService: GeoStoreService
  ) { }

  public resetMap(): void
  {
    this.geoService.showInput.next(true)
    this.geoStoreService.start.next(null)
    this.geoStoreService.stopps.next([])
    this.geoStoreService.destination.next(null)
    this.geoStoreService.route.next(undefined)
    this.geoStoreService.carType.next(null)
    this.geoStoreService.currentPoint.next(null)
    this.geoService.flyMapTo(51.1657, 10.4515, 6, 1)
  }

  public clearMap(): void
  {
    this.geoStoreService.start.next(null)
    this.geoStoreService.stopps.next([])
    this.geoStoreService.destination.next(null)
    this.geoStoreService.route.next(undefined)
    this.geoStoreService.carType.next(null)
    this.rideSimulationStore.simulationLayer.clearLayers()
    this.geoService.flyMapTo(51.1657, 10.4515, 6, 1)
  }
}
