import {Component, inject, signal, ViewChild, OnInit, AfterViewInit, effect} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import {MatSort, MatSortHeader, MatSortModule, Sort} from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import {Router} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AuthService} from "../../services/auth/auth-service.service";
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {HistoryService} from '../../services/history/history.service';
import {HistoryDataSource} from '../../services/history/history.dataSource';



@Component({
  selector: 'app-drivinghistory',
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatSortHeader,
    MatSort,
    MatSortModule
  ],
  templateUrl: './drivinghistory.component.html',
  styleUrl: './drivinghistory.component.scss'
})



export class DrivinghistoryComponent implements OnInit, AfterViewInit  {


  displayedColumns: string[] = ['historyId', 'finishDate', 'drivenDistance', 'price', 'drivenTime',
    'ratingCustomer', 'ratingDriver', 'customer', 'driver'];
  dataSource!: HistoryDataSource;

  constructor(private router: Router, private historyService: HistoryService) {
    //Weil Signal
    effect(() => {
      this.dataSource.filter$.next(this.searchTerm());
    });
  }

  private _liveAnnouncer = inject(LiveAnnouncer);
  private auth: AuthService = inject(AuthService);
  isLoggedIn = this.auth.isLoggedIn;

  searchTerm = signal<string>('');

  //Bei Initialisierung, mache ...
  ngOnInit(): void {
    this.dataSource = new HistoryDataSource(this.historyService);
    // @ts-ignore
    this.dataSource.loadHistory()
  }

  //Verbindung html => So dass ich Änderungen an der Tabelle mitbekomme (weil sort, filter)
  @ViewChild('sort') sort!: MatSort;
    //Weil ViewChild => Ich will Änderungen mitbekommen
    ngAfterViewInit() {
      if (this.sort) {
        setTimeout(() => {
          this.sort!.active = 'historyId';
          this.sort!.direction = 'desc';
          this.sort!.sortChange.emit({ active: 'historyId', direction: 'desc' });
          this.dataSource.sort = this.sort!;
        });
      }/* else {
        console.warn('MatSort nicht initialisiert.');
      }*/
    }

  //Sternchen laden.
  getStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const stars = Array(fullStars).fill('star'); //Kommen von Google fonts Material-Icons
    if (halfStar) stars.push('star_half');
    while (stars.length < 5) stars.push('star_border');
    return stars;
  }
  //Wenn Pfeil gedrückt,...
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}
