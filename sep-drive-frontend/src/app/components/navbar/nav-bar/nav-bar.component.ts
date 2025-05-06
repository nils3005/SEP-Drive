import { Component } from '@angular/core';
import {NavLogoComponent} from '../nav-logo/nav-logo.component';
import {NavLinkComponent} from '../nav-link/nav-link.component';
import {NavLink} from '../../../types';

@Component({
  selector: 'app-nav-bar',
  imports: [
    NavLogoComponent,
    NavLinkComponent
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


}
