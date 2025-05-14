import {Component, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {AuthService} from "../../../../services/auth/auth-service.service";


@Component({
  selector: 'app-authentication',
  imports: [FormsModule, CommonModule],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss'
})
export class AuthenticationComponent {
  private auth = inject(AuthService);
  private router: Router = inject(Router);
  errorMessage = '';

  code: string = '';
  username: string = history.state.username;
  password: string = history.state.password;

  onVerify() {
    console.log('Hello from authentication component ', this.username, this.password, this.code);
    this.auth
        .verify(this.username, this.code)
        .subscribe({
          error: err => {
            this.errorMessage = err.message;
          }
        });
  }

  toSuperCode() {
    this.router.navigate(['/supercode'], {state: {username: this.username, password: this.password}});
  }

  toPassword() {
    this.router.navigate(['/password']);
  }

}
