import {Injectable} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {fahrt} from '../../types';
import {BehaviorSubject, combineLatest, map, Observable} from 'rxjs';
import {HistoryService} from './history.service';
import {MatSort, Sort} from '@angular/material/sort';

//Wird im Grunde so behandelt wie ein Service => Ich möchte die spezifischen Methoden für meine Tabelle
@Injectable()
export class HistoryDataSource extends DataSource <fahrt> {
  fahrt$ = new BehaviorSubject<fahrt[]>([]);
  isLoading$ = new BehaviorSubject<boolean>(false);
  private sortSubject = new BehaviorSubject<Sort>({ active: '', direction: '' });
  filter$ = new BehaviorSubject<string>('');

  private _sort: MatSort | null = null;

  set sort(sort: MatSort) {
    if (this._sort !== sort) {
      this._sort = sort;
      sort.sortChange.subscribe((s: Sort) => this.sortSubject.next(s));
      this.sortSubject.next({ active: sort.active, direction: sort.direction });
    }
  }
  //Ist der Pfeil angeklickt worden? => Was soll sortiert werden?
  get sortChange$(): Observable<Sort> {
    return this.sortSubject.asObservable();
  }

  constructor(private historyService: HistoryService){
    super();
  }

  //Historie wird erstellt, beim laden des Components
  connect(): Observable<fahrt[]> {
    return combineLatest([
      this.fahrt$,
      this.sortChange$,
      this.filter$
    ]).pipe( //Wir nehmen Daten und packen sie durch ne "Röhre", damit wir andere Daten haben
      map(([data, sort, filter]) => { //Hier wird erst die korrigierte Tabelle erstellt!
        const sorted = this.sortData(data, sort);
        return this.filterData(sorted, filter);
      })
    );
  }
  //Component zu.
  disconnect(): void {
    this.fahrt$.complete();
    this.filter$.complete();
    this.isLoading$.complete();
  }
  //History laden bzw. über Service an die Daten kommen
  loadHistory(): void{
    this.isLoading$.next(true);
    this.historyService.getHistory().subscribe((fahrt) => {
      this.fahrt$.next(fahrt)
      this.isLoading$.next(false);
    });
  }
  //Sortieren
  private sortData(data: fahrt[], sort: Sort): fahrt[] {
    if (!sort || !sort.active || sort.direction === '') return data;

    return [...data].sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      //Switch-Case Statt else if
      switch (sort.active) {
        case 'historyId': return compare (a.historyId, b.historyId, isAsc);
        case 'price': return compare(a.price, b.price, isAsc);
        case 'drivenDistance': return compare (a.drivenDistance, b.drivenDistance, isAsc);
        case 'drivenTime': return compare (a.drivenTime, b.drivenTime, isAsc);
        case 'ratingCustomer': return compare (a.ratingCustomer, b.ratingCustomer, isAsc);
        case 'ratingDriver': return compare (a.ratingDriver, b.ratingDriver, isAsc);
        case 'finishDate': return compare(a.finishDate, b.finishDate, isAsc);
        case 'driver': {
          const nameA = `${a.lastNameDriver} ${a.firstNameDriver}`;
          const nameB = `${b.lastNameDriver} ${b.firstNameDriver}`;
          return compare(nameA, nameB, isAsc);
        }
        case 'customer': {
          const nameA = `${a.lastNameCustomer} ${a.firstNameCustomer}`;
          const nameB = `${b.lastNameCustomer} ${b.firstNameCustomer}`;
          return compare(nameA, nameB, isAsc);
        }
        default: return 0;
      }
    });
  }

  //Namen suchen
  private filterData(data: fahrt[], filter: string): fahrt[] {
    const term = filter.toLowerCase().trim();
    if (!term) return data;


    return data.filter(fahrt => {
      const customer = `${fahrt.firstNameCustomer} ${fahrt.lastNameCustomer} ${fahrt.usernameCustomer}`.toLowerCase();
      const driver = `${fahrt.firstNameDriver} ${fahrt.lastNameDriver} ${fahrt.usernameDriver}`.toLowerCase();
      return customer.includes(term) || driver.includes(term);
    });
  }
}

// Compare to => Brauche ich fürs Sortieren!
function compare(a: any, b: any, isAsc: boolean) {
  //If a vor b, dann gib -1 zurück, sonst 1.
  //If Richtung ASC, (*1), (*-1)
  //--,...
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
