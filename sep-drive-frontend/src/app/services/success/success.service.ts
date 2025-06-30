import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SuccessService {

  constructor() { }
  private successSubject = new Subject<string>();
  public success$ = this.successSubject.asObservable();

  showSuccess(message: string) {
    this.successSubject.next(message);
  }
}
