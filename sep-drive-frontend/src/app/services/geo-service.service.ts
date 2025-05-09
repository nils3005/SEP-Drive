import { Injectable } from '@angular/core';
import {GeocodeFeature} from '../types';

@Injectable({
  providedIn: 'root'
})
export class GeoServiceService {

  constructor() { }

  public getCoordinateArray(geoCodes: GeocodeFeature[]): number[][]
  {
    let coordinates: number[][] = [];

    for (const geoCode of geoCodes) {
      coordinates.push([geoCode.geometry.coordinates[0], geoCode.geometry.coordinates[1]]);
    }
    return coordinates;
  }
}
