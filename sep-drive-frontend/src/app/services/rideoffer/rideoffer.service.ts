import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {RideOffer} from "../../types";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RideofferService {
  private baseUrl = 'http://localhost:8080/api';
  private http: HttpClient = inject(HttpClient);

  /**
   * Neue Angebot erstellen (als Fahrer).
   */
  createOffer(rideRequestId: number): Observable<RideOffer> {
        return this.http.post<RideOffer>(`${this.baseUrl}/offers/${rideRequestId}`, {});
  }

  getRideOfferById(rideOffer: number): Observable<RideOffer> {
    return this.http.get<RideOffer>(`${this.baseUrl}/${rideOffer}`);
  }

  /**
   * Angebot zurückziehen (als Fahrer).
   */
  withdrawRideOfferWithRideRequestId(rideRequestId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/offers/${rideRequestId}`);
  }

  /**
   * Alle PENDING-Angebote für eine Fahranfrage (als Kunde),
   * mit optionaler Sortierung.
   */
  getOffersForRequest(rideRequestId: number, sortBy: string = 'rating', direction: string = 'desc'): Observable<any[]> {  // TODO Array von RideOffer?
    let params = new HttpParams()
        .set('sortBy', sortBy)
        .set('direction', direction);
    return this.http.get<any[]>(`${this.baseUrl}/ride-requests/${rideRequestId}/offers`, { params });
  }

  getPendingOfferForDriver(driverId: number): Observable<RideOffer> {
    return this.http.get<RideOffer>(`${this.baseUrl}/offers/drivers/${driverId}`);
  }

  /**
   * Kunde nimmt ein Angebot an.
   */
  acceptOffer(offerId: number): Observable<RideOffer> {
    return this.http.post<RideOffer>(`${this.baseUrl}/offers/${offerId}/accept`, {});
  }

  /**
   * Kunde lehnt ein Angebot ab.
   */
  rejectOffer(offerId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/offers/${offerId}/reject`, {});
  }
}
