import {Injectable, signal, Signal} from '@angular/core';
import {Ride} from '../../types';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RideSimulationStore {

  public ride: BehaviorSubject<Ride | null> = new BehaviorSubject<Ride | null>(null);

  public start = signal<string>('');
  public destination = signal<string>('');

  constructor() { }
}
