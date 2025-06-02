import {Component, computed, inject, signal} from '@angular/core';
import {UserService} from "../../services/user/user.service";
import {FormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {AuthService} from "../../services/auth/auth-service.service";
import {toSignal} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-social',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './social.component.html',
  styleUrl: './social.component.scss'
})
export class SocialComponent {
  private userService = inject(UserService);
  auth: AuthService = inject(AuthService);

  users = toSignal(this.userService.getUsers(), { initialValue: [] });
  searchTerm = signal<string>('');
  filteredUsers = computed(() =>
      this.users().filter(u =>
          u.username.toLowerCase().includes(this.searchTerm().toLowerCase())
      )
  );

}
