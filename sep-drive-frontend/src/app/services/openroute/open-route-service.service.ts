import {inject, Injectable} from '@angular/core';
import {AddressAutocompleteSuggestion, Coordinates, GeocodeFeature} from '../../types';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs'

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

  public getGeocodeFeatureByCoordinates(cords: Coordinates): Observable<HttpResponse<AddressAutocompleteSuggestion>>
  {
      return this.http.get<any>(
          `https://api.openrouteservice.org/geocode/reverse?api_key=${this.apiKey}&point.lon=${cords.longitude}&point.lat=${cords.latitude}`,
          {
            headers: {
              accept: 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
            },
            observe: "response"
          }
      )
  }

  public getRouteFromPointArray(waypoints: number[][]): Observable<any> {
  return this.http.post<any>(
      `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
      {
          'coordinates': waypoints
      },
      {
          headers: {
              accept: 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
              authorization: `${this.apiKey}`
          },
          observe: 'response'
      }
    )
  }
}
