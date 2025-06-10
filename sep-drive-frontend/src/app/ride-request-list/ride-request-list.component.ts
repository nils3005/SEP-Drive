import {AfterViewInit, Component, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

export interface rideRequestData {
  fahrtid: number;
  zeitpunkt: string;
  entfernung: number;
  name: string;
  bewertung: number;
  klasse: string;
}

const dummy: rideRequestData[] = [
  {
    fahrtid: 1,
    zeitpunkt: '12.05.2025 12:25',
    entfernung: 6,
    name: 'Isabela Mercedes',
    bewertung: 3,
    klasse: 'Deluxe'
  },
  {
    fahrtid: 2,
    zeitpunkt: '12.05.2025 11:23',
    entfernung: 12,
    name: 'Max Mustermann',
    bewertung: 4.5,
    klasse: 'Small'
  },
  {
    fahrtid: 3,
    zeitpunkt: '12.05.2025 12:01',
    entfernung: 30,
    name: 'Romario Dos Santos',
    bewertung: 5,
    klasse: 'Deluxe'
  },
];

@Component({
  selector: 'app-ride-request-list',
  standalone: true,
  templateUrl: './ride-request-list.component.html',
  styleUrl: './ride-request-list.component.scss',
  imports: [FormsModule, CommonModule, MatTableModule, MatSortModule]
})
export class RideRequestListComponent implements AfterViewInit{
  displayedColumns: string[] = ['fahrtid', 'zeitpunkt', 'entfernung', 'name', 'bewertung', 'klasse', 'annehmen'];
  dataSource = new MatTableDataSource<rideRequestData>(dummy);

  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  getStarClass(rating: number, star: number): string {
    if (rating >= star) {
      return 'fas fa-star'; // voller Stern
    } else if (rating >= star - 0.5) {
      return 'fas fa-star-half-alt'; // halber Stern
    } else {
      return 'far fa-star'; // leerer Stern
    }
  }



}
