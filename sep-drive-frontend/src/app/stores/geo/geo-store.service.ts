import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {GeocodeFeature} from '../../types';
import * as L from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class GeoStoreService {

  public start: BehaviorSubject<GeocodeFeature | null> = new BehaviorSubject<GeocodeFeature | null>(null);
  public stopps: BehaviorSubject<GeocodeFeature[]> = new BehaviorSubject<GeocodeFeature[]>([]);
  public destination: BehaviorSubject<GeocodeFeature | null> = new BehaviorSubject<GeocodeFeature | null>(null);

  public routeLayer: L.LayerGroup = L.layerGroup();
  public startLayer: L.LayerGroup = L.layerGroup();
  public stoppsLayer: L.LayerGroup = L.layerGroup();
  public destinationLayer: L.LayerGroup = L.layerGroup();

  public currentPoint: BehaviorSubject<GeocodeFeature | null> = new BehaviorSubject<GeocodeFeature | null>(null);

  public carType: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  public map: L.Map | undefined;

  public route: BehaviorSubject<any> = new BehaviorSubject<any>(null);

}
