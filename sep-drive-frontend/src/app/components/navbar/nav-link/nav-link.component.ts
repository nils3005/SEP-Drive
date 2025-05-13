import {Component, Input} from '@angular/core';
import {NavLink} from '../../../types';

@Component({
  selector: 'app-nav-link',
  imports: [],
  templateUrl: './nav-link.component.html',
  styleUrl: './nav-link.component.scss'
})
export class NavLinkComponent {
  @Input({required: true,}) navLink!: NavLink;
}
