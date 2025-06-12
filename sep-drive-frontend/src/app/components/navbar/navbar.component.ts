import {Component, inject} from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {AuthService} from "../../services/auth/auth-service.service";

@Component({
  selector: 'app-nav-bar',
  imports: [
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  auth: AuthService = inject(AuthService);

  logout(): void {
    this.auth.logout();
  }

}
