import {Injectable} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import { leaderboard } from '../../types';
import {BehaviorSubject, combineLatest, map, Observable} from 'rxjs';
import {MatSort, Sort} from '@angular/material/sort';
import { LeaderboardService } from './leaderboard.service';

//Wird im Grunde so behandelt wie ein Service => Ich möchte die spezifischen Methoden für meine Tabelle
@Injectable()
export class LeaderboardDataSource extends DataSource <leaderboard> {
  leaderboard$ = new BehaviorSubject<leaderboard[]>([]);
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

  constructor(private leaderboardService: LeaderboardService) {
    super();
  }

  //Leaderboard wird erstellt, beim laden des Components
  connect(): Observable<leaderboard[]> {
    return combineLatest([
      this.leaderboard$,
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
    this.leaderboard$.complete();
    this.filter$.complete();
    this.isLoading$.complete();
  }
  //Leaderboard laden bzw. über Service an die Daten kommen
  loadLeaderboard(): void{
    this.isLoading$.next(true);
    this.leaderboardService.getLeaderboard().subscribe((leaderboard) => {
      this.leaderboard$.next(leaderboard)
      this.isLoading$.next(false);
    });
  }
  //Sortieren
  private sortData(data: leaderboard[], sort: Sort): leaderboard[] {
    if (!sort || !sort.active || sort.direction === '') return data;

    return [...data].sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      //Switch-Case Statt else if
      switch (sort.active) {
        case 'distance': return compare (a.distance, b.distance, isAsc);
        case 'money': return compare (a.money, b.money, isAsc);
        case 'rating': return compare (a.rating, b.rating, isAsc);
        case 'numberOfRides': return compare (a.numberOfRides, b.numberOfRides, isAsc);
        case 'driveTime': return compare (a.driveTime, b.driveTime, isAsc);
        case 'name': {
          const nameA = `${a.name} ${a.username}`;
          const nameB = `${b.name} ${b.username}`;
          return compare(nameA, nameB, isAsc);
        }

        default: return 0;
      }
    });
  }

  //Namen suchen
  private filterData(data: leaderboard[], filter: string): leaderboard[] {
    const term = filter.toLowerCase().trim();
    if (!term) return data;


    return data.filter(leaderboard => {
      const driver = `${leaderboard.name} ${leaderboard.username}`.toLowerCase();
      return driver.includes(term);
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
