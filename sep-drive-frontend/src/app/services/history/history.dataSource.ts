import {Injectable} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {fahrt} from '../../types';
import {BehaviorSubject, Observable} from 'rxjs';
import {HistoryService} from './history.service';

@Injectable()
export class HistoryDataSource extends DataSource <fahrt> {
  fahrt$ = new BehaviorSubject<fahrt[]>([]);
  isLoading$ = new BehaviorSubject<boolean>(false);


  constructor(private historyService: HistoryService){
    super();
  }


  connect(): Observable<fahrt[]> {
    return this.fahrt$.asObservable();
  }
  disconnect(): void {
    this.fahrt$.complete();
  }

  loadHistory(): void{
    console.log("here")
    this.isLoading$.next(true);
    this.historyService.getHistory().subscribe((fahrt) => {
      this.fahrt$.next(fahrt)
      this.isLoading$.next(false);
    });
  }
}
