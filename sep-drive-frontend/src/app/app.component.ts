import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NavbarComponent} from "./components/navbar/navbar.component";
import {ErrorComponent} from './components/error/error.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, ErrorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'sep-drive-frontend';
}
