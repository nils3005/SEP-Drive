import {inject, Injectable} from '@angular/core';
import {AddressAutocompleteSuggestion, GeocodeFeature} from '../types';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import * as L from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class OpenRouteServiceService {

  private http = inject(HttpClient);
  private apiKey = "YOUR_OPENROUTESERVICE_API_KEY"

  constructor() { }

  public getAutocompleteSuggestions(input: string): Observable<AddressAutocompleteSuggestion>
  {
    return this.http.get<AddressAutocompleteSuggestion>(
      `https://api.openrouteservice.org/geocode/autocomplete?api_key=${this.apiKey}&text=${input}`,
      {
      headers: {
        accept: 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
      }
    })
  }

  public getRouteBetweenPoints(start: GeocodeFeature, end: GeocodeFeature): Observable<any>
  {
    return this.http.get<any>(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${this.apiKey}&start=${start.geometry.coordinates[0]},${start.geometry.coordinates[1]}&end=${end.geometry.coordinates[0]},${end.geometry.coordinates[1]}`,
      {
        headers: {
          accept: 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
        }
      })
  }
}
