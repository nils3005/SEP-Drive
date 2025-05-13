import {Component} from '@angular/core';
import {NavLogoComponent} from '../nav-logo/nav-logo.component';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {Observable} from "rxjs";
import {AuthService} from "../../../services/auth/auth-service.service";
import {AsyncPipe} from "@angular/common";
import {User} from "../../../types";

@Component({
  selector: 'app-nav-bar',
  imports: [
    NavLogoComponent,
    RouterLinkActive,
    RouterLink,
    AsyncPipe
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {
  user$: Observable<User|null>;
  isLoggedIn$: Observable<boolean>;

  constructor(private auth: AuthService) {
    this.user$ = this.auth.user$;
    this.isLoggedIn$ = this.auth.isLoggedIn$;
  }

  logout(): void {
    this.auth.logout();
  }

}
