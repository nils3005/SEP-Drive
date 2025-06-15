import {Injectable, signal, Signal} from '@angular/core';
import {Ride, RideRequestSummary, RideResponse, RideUpdateDTO} from '../../types';
import {BehaviorSubject} from 'rxjs';
import * as L from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class RideSimulationStore {

  public ride: BehaviorSubject<RideResponse | null> = new BehaviorSubject<RideResponse | null>(null);

  public motionPolyLine: any

  public started: boolean = false;

  public simulationLayer = L.layerGroup();

  public rideSummary: BehaviorSubject<RideRequestSummary | null> = new BehaviorSubject<RideRequestSummary | null>(null);

  public ridePrice: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public rideData : BehaviorSubject<RideUpdateDTO> = new BehaviorSubject<RideUpdateDTO>({
    rideId: this.ride.getValue()?.ride.rideId ?? -1,
    paused: true,
    resuming: false,
    completed: false,
    speed: 15,
    coordsIndex: 0,
    historyId: null
  });

  public start = signal<string>('');
  public destination = signal<string>('');

  constructor() {
  }
}
