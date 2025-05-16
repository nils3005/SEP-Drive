import {Component, inject} from '@angular/core';
import {NavLogoComponent} from '../nav-logo/nav-logo.component';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {AuthService} from "../../../services/auth/auth-service.service";

@Component({
  selector: 'app-nav-bar',
  imports: [
    NavLogoComponent,
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {
  auth: AuthService = inject(AuthService);
  isLoggedIn = this.auth.isLoggedIn;
  user = this.auth.user;

  logout(): void {
    this.auth.logout();
  }

}
