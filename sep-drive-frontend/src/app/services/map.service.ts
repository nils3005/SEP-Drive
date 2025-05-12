import { Injectable } from '@angular/core';
import {GeoService} from './geo.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(private geoService: GeoService) { }

  public resetMap(): void
  {
    this.geoService.showInput.next(true)
    this.geoService.waypoints.next([])
    this.geoService.route.next(undefined)
    this.geoService.carType.next(null)
    this.geoService.flyMapTo(51.1657, 10.4515, 6, 1)
  }
}
