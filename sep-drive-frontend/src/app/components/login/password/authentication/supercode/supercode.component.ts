import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-supercode',
  imports: [FormsModule, CommonModule],
  templateUrl: './supercode.component.html',
  styleUrl: './supercode.component.scss'
})
export class SupercodeComponent {
  code: string="";
  errorMessage: string="";
  username: string= history.state.username;

  constructor(private http: HttpClient, private router: Router) {
  }

  backToAuthentication(){
    this.router.navigate(['/authentication']);
  }

  onVerify(){

    //testen, ob der jwt wirklich gespeichert wird
    // console.log(localStorage.getItem('jwt'));

    this.http.post('http://localhost:8080/auth/verify', {  username: this.username,
      code: this.code //der supercode ist: 0000
    }, { headers: { 'Content-Type': 'application/json' }, responseType: 'text' }).subscribe({
        next: (token) => {
          localStorage.setItem('jwt', token); // ← Das ist alles, was du brauchst
          this.router.navigate(['/']);
        },
      error: (err) => {
        this.errorMessage = 'Verifizierung fehlgeschlagen: ' + err.error;
      }
    });
  }

}
