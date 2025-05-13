import {Component, OnInit} from '@angular/core';
import {ErrorService} from '../../services/error/error.service';

@Component({
  selector: 'app-error',
  imports: [],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss'
})
export class ErrorComponent implements OnInit{
  message: string | null = null;
  timeout: any;

  constructor(private errorService: ErrorService) {}

  ngOnInit() {
    this.errorService.error$.subscribe(msg => {
      this.message = msg;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this.close(), 5000);
    });
  }

  close() {
    this.message = null;
  }
}
