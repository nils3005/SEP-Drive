import {Component, inject, signal, ViewChild, OnInit, AfterViewInit, effect} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import {MatSort, MatSortHeader, MatSortModule, Sort} from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import {Router} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AuthService} from "../../services/auth/auth-service.service";
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {LeaderboardDataSource} from '../../services/leaderboard/leaderboard.dataSource';
import {LeaderboardService} from '../../services/leaderboard/leaderboard.service';



@Component({
  standalone: true,
  selector: 'app-leaderboard',
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
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})



export class LeaderboardComponent implements OnInit, AfterViewInit  {


  displayedColumns: string[] = ['name', 'distance', 'money', 'numberOfRides', 'rating', 'driveTime'];
  dataSource!: LeaderboardDataSource;

  constructor(private router: Router, private leaderboardService: LeaderboardService) {
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
    this.dataSource = new LeaderboardDataSource(this.leaderboardService);
    // @ts-ignore
    this.dataSource.loadLeaderboard()
  }

  //Verbindung html => So dass ich Änderungen an der Tabelle mitbekomme (weil sort, filter)
  @ViewChild('sort') sort!: MatSort;
  //Weil ViewChild => Ich will Änderungen mitbekommen
  ngAfterViewInit() {
    if (this.sort) {
      setTimeout(() => {
        this.sort!.active = 'rating';
        this.sort!.direction = 'desc';
        this.sort!.sortChange.emit({ active: 'rating', direction: 'desc' });
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
