import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {AuthService} from "../../../../../services/auth/auth-service.service";

@Component({
  selector: 'app-supercode',
  imports: [FormsModule, CommonModule],
  templateUrl: './supercode.component.html',
  styleUrl: './supercode.component.scss'
})
export class SupercodeComponent {
  code: string="";
  errorMessage: string="";
  username: string = history.state.username;
  password: string = history.state.password;
  router: Router = inject(Router);
  auth: AuthService = inject(AuthService);

  backToAuthentication(){
    this.router.navigate(['/authentication'], {state: {username: this.username, password: this.password}});
  }

  onVerify() {
    this.auth
        .verify(this.username, this.code)
        .subscribe({
          error: err => {
            this.errorMessage = err.message;
          }
        });
  }
}
