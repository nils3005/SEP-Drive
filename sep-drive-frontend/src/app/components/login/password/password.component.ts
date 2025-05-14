import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';


@Component({
  selector: 'app-password',
  imports: [FormsModule, CommonModule],
  templateUrl: './password.component.html',
  styleUrl: './password.component.scss'
})
export class PasswordComponent {
  username: string = history.state.username;
  password: string = '';
  errorMessage: string = '';
  router: Router = inject(Router);

  onSignIn() {
    this.router.navigate(['authentication'], { state: {
      username: this.username, password: this.password }
    }); // zur authentication navigieren, username und password weiterhin zwischenspeichern
  }
}
