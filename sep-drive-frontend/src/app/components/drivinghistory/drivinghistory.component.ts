import {Component, inject, signal, ViewChild, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import {MatSort, MatSortHeader, Sort} from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import {Router} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AuthService} from "../../services/auth/auth-service.service";
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {fahrt} from "../../types"
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
    MatSort
  ],
  templateUrl: './drivinghistory.component.html',
  styleUrl: './drivinghistory.component.scss'
})



export class DrivinghistoryComponent implements OnInit {


  displayedColumns: string[] = ['historyId', 'finishDate', 'drivenDistance', 'price', 'drivenTime',
    'ratingCustomer', 'ratingDriver', 'customer', 'driver'];
  dataSource!: HistoryDataSource;

  constructor(private router: Router, private historyService: HistoryService) {}

  private _liveAnnouncer = inject(LiveAnnouncer);
  private auth: AuthService = inject(AuthService);
  isLoggedIn = this.auth.isLoggedIn;

  searchTerm = signal<string>('');

  ngOnInit(): void {
    this.dataSource = new HistoryDataSource(this.historyService);
    // @ts-ignore
    this.dataSource.loadHistory();
  }






  @ViewChild(MatSort) sort: MatSort | undefined;

    ngAfterViewInit() {
      // @ts-ignore
      this.dataSource.sort = this.sort;
    }


  getStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const stars = Array(fullStars).fill('star');
    if (halfStar) stars.push('star_half');
    while (stars.length < 5) stars.push('star_border');
    return stars;
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}
