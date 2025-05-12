import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username: string ='';
  errorMessage: string='';

  constructor(private router: Router, private http: HttpClient) {}


  onSignIn() {

   this.http.post('http://localhost:8080/auth/checkUsername', this.username, {responseType: 'text'}).subscribe({
      next: (response: any) => {
        this.router.navigate(['/password'], { state: { username: this.username } }); // zur passworteingabe navigieren, username weiterhin zwischenspeichern
      },
      error: (err) => {
        this.errorMessage = 'Der Benutzername existiert nicht.';
      }
    });

   // this.router.navigate(['/password'], { state: { username: this.username } });
  }



  toRegister(){
    this.router.navigate(['/']); //hier der register link
  }
  }

