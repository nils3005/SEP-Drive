import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {RideOffer} from "../../types";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RideofferService {
  private baseUrl = '/api';
  private http: HttpClient = inject(HttpClient);

  /**
   * Neue Angebot erstellen (als Fahrer).
   */
  createOffer(rideRequestId: number, priceInCents: number): Observable<RideOffer> {
    const body = {
      rideRequestId,
      priceInCents
    };
    return this.http.post<RideOffer>(`${this.baseUrl}/offers`, body);
  }

  /**
   * Angebot zurückziehen (als Fahrer).
   */
  withdrawOffer(offerId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/offers/${offerId}`);
  }

  /**
   * Alle PENDING-Angebote für eine Fahranfrage (als Kunde),
   * mit optionaler Sortierung.
   */
  getOffersForRequest(rideRequestId: number, sortBy: string = 'rating', direction: string = 'desc'): Observable<RideOffer[]> {
    let params = new HttpParams()
        .set('sortBy', sortBy)
        .set('direction', direction);
    return this.http.get<RideOffer[]>(`${this.baseUrl}/ride-requests/${rideRequestId}/offers`, { params });
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
