import {Component, inject} from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {AuthService} from "../../../services/auth/auth-service.service";

@Component({
  selector: 'app-nav-bar',
  imports: [
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
