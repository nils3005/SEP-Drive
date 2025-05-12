import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username: string ='';

  constructor(private router: Router, private http: HttpClient) {}


  onSignIn() {

        // der username wird zwischengespeichert, danach wird zur passwortseite navigiert
        this.router.navigate(['/password'], { state: { username: this.username } });
      }

  }

