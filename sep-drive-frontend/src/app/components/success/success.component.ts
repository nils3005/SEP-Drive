import {Component, OnInit} from '@angular/core';
import {ErrorService} from '../../services/error/error.service';
import {SuccessService} from '../../services/success/success.service';

@Component({
  selector: 'app-success',
  imports: [],
  templateUrl: './success.component.html',
  styleUrl: './success.component.scss'
})
export class SuccessComponent implements OnInit {
  message: string | null = null;
  timeout: any;

  constructor(private successService: SuccessService) {}

  ngOnInit() {
    this.successService.success$.subscribe(msg => {
      this.message = msg;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this.close(), 5000);
    });
  }

  close() {
    this.message = null;
  }
}
