import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {UserService} from "../../services/user/user.service";
import {FormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {User} from "../../types";
import {AuthService} from "../../services/auth/auth-service.service";
import {AsyncPipe} from "@angular/common";

@Component({
  selector: 'app-social',
  imports: [
    FormsModule,
    RouterLink,
    AsyncPipe
  ],
  templateUrl: './social.component.html',
  styleUrl: './social.component.scss'
})
export class SocialComponent implements OnInit {
  private userService = inject(UserService);
  private auth: AuthService = inject(AuthService);
  isLoggedIn$ = this.auth.isLoggedIn$;
  users = signal<User[]>([]);
  searchTerm = signal<string>('');

  filteredUsers = computed(() =>
      this.users().filter(u =>
          u.username.toLowerCase().includes(this.searchTerm().toLowerCase())
      )
  );

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers() {
    this.userService.getUsers().subscribe({
      next: list => this.users.set(list),
      //error: err => console.error('Fehler beim Laden der User:', err)
    });
  }
}
