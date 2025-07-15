import {Component, computed, effect, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartData, ChartOptions } from 'chart.js';

import { StatisticsService } from '../../services/statistics/statistics.service';
import {StatisticsDto, User} from '../../types';
import {BaseChartDirective} from 'ng2-charts';
import {AuthService} from '../../services/auth/auth-service.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseChartDirective,
  ],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent {
  auth: AuthService = inject(AuthService);
  viewType: 'month' | 'year' = 'month';
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;

  noInput = signal(false);

  user = signal<User|null>(null);


  statistics: StatisticsDto[] = [];

  incomeChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  distanceChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  timeChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  ratingChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  chartOptions: ChartOptions = { responsive: true };

  constructor(private statisticsService: StatisticsService) {
    this.noInput = signal(false);
    effect(() => {
      this.user.set(this.auth.user());
    });
  }

  onSubmit(): void {
    this.noInput.set(true);
    const { start, end } = this.calculateTimespan();
    const obs$ = this.viewType === 'month'
      ? this.statisticsService.getDailyStatistics(start, end)
      : this.statisticsService.getMonthlyStatistics(start, end);

    obs$.subscribe(data => {
      this.statistics = data;
      this.buildCharts();
    });
  }

  private calculateTimespan(): { start: number; end: number } {
    if (this.viewType === 'month') {
      const start = this.formatDate(new Date(this.selectedYear, this.selectedMonth - 1, 1));
      const endDate = new Date(this.selectedYear, this.selectedMonth, 0); // letzter Tag des Monats
      const end = this.formatDate(endDate);
      return { start, end };
    } else {
      const start = this.selectedYear * 100 + 1;   // YYYY01
      const end = this.selectedYear * 100 + 12;    // YYYY12
      return { start, end };
    }
  }

  private formatDate(date: Date): number {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return parseInt(`${yyyy}${mm}${dd}`, 10);
  }

  private fillDataForDays(labels: string[], field: keyof StatisticsDto): number[] {
    return labels.map(dayLabel => {
      const stat = this.statistics.find(s => {
        const statDateStr = s.timespan.toString();
        const statDay = parseInt(statDateStr.slice(-2), 10);
        return statDay === parseInt(dayLabel, 10);
      });

      let value = stat && stat[field] != null ? Number(stat[field]) : 0;

      if (field === 'drivenDistance') {
        value = value / 1000;
      }
      if (field === 'drivenTime') {
        value = value / 60;
      }

      return value;
    });
  }

  private fillDataForMonths(labels: string[], field: keyof StatisticsDto): number[] {
    return labels.map((_, index) => {
      const stat = this.statistics.find(s => {
        let statMonth = 0;
        const ts = s.timespan.toString();
        if (ts.length === 6) {
          statMonth = parseInt(ts.slice(-2), 10);  // YYYYMM
        } else if (ts.length === 8) {
          statMonth = parseInt(ts.slice(4, 6), 10); // YYYYMMDD
        }
        return statMonth === index + 1;
      });

      let value = stat && stat[field] != null ? Number(stat[field]) : 0;

      if (field === 'drivenDistance') {
        value = value / 1000;
      }
      if (field === 'drivenTime') {
        value = value / 60;
      }

      return value;
    });
  }

  private buildCharts(): void {
    if (this.viewType === 'month') {
      const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();

      const labels = Array.from({length: daysInMonth}, (_, i) =>
        String(i + 1).padStart(2, '0')
      );

      this.incomeChartData = {
        labels,
        datasets: [{
          data: this.fillDataForDays(labels, 'income'),
          label: 'Einnahmen',
          backgroundColor: '#914141'
        }]
      };

      this.distanceChartData = {
        labels,
        datasets: [{
          data: this.fillDataForDays(labels, 'drivenDistance'),
          label: 'Gefahrene Distanz',
          backgroundColor: '#914141'
        }]
      };

      this.timeChartData = {
        labels,
        datasets: [{
          data: this.fillDataForDays(labels, 'drivenTime'),
          label: 'Fahrzeit',
          backgroundColor: '#914141'
        }]
      };

      this.ratingChartData = {
        labels,
        datasets: [{
          data: this.fillDataForDays(labels, 'averageRating'),
          label: 'Bewertungen',
          backgroundColor: '#914141'
        }]
      };
    } else {
      const labels = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

      this.incomeChartData = {
        labels,
        datasets: [{
          data: this.fillDataForMonths(labels, 'income'),
          label: 'Einnahmen',
          backgroundColor: '#914141'
        }]
      };

      this.distanceChartData = {
        labels,
        datasets: [{
          data: this.fillDataForMonths(labels, 'drivenDistance'),
          label: 'Gefahrene Distanz',
          backgroundColor: '#914141'
        }]
      };

      this.timeChartData = {
        labels,
        datasets: [{
          data: this.fillDataForMonths(labels, 'drivenTime'),
          label: 'Fahrzeit',
          backgroundColor: '#914141'
        }]
      };

      this.ratingChartData = {
        labels,
        datasets: [{
          data: this.fillDataForMonths(labels, 'averageRating'),
          label: 'Bewertungen',
          backgroundColor: '#914141'
        }]
      };
    }
  }
}
