import {Component, inject} from '@angular/core';
import {NavLogoComponent} from '../nav-logo/nav-logo.component';
import {NavLink} from '../../../types';
import {UserServiceService} from "../../../services/user/user-service.service";
import {RouterLink, RouterLinkActive} from "@angular/router";

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
  navLinks: NavLink[] = [
    {
      id: 1,
      title: 'Routenplanung',
      active: true,
      link: '/',
    },
    {
      id: 2,
      title: 'Social',
      active: false,
      link: '/social',
    }
  ]

  isLoggedIn = false;

  userService = inject(UserServiceService);

  ngOnInit(): void {
    this.userService.getUserStatus().subscribe(status => {
      this.isLoggedIn = status;
    });
  }

  logout(): void {
    this.userService.logout();
  }

}
