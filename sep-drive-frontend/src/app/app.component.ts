import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NavBarComponent} from "./components/navbar/nav-bar/nav-bar.component";
import {ErrorComponent} from "./components/error/error.component";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBarComponent, ErrorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'sep-drive-frontend';
}
