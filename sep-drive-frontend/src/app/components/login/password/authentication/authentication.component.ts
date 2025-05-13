import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';


@Component({
  selector: 'app-authentication',
  imports: [FormsModule, CommonModule],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss'
})
export class AuthenticationComponent {
  code: string='';
  username: string = history.state.username;
  errorMessage: string='';

  constructor(private http: HttpClient, private router: Router) {
  }

  toSuperCode(){
    this.router.navigate(['/supercode'], {state: {username: this.username} });
  }

  toPassword(){
    this.router.navigate(['/password']);
  }

  onVerify(){

    //testen ob wirklich alle daten geschickt werden
    console.log('Verify payload:', {
      username: this.username,
      code: this.code
    });
    //code soll gecheckt werden, wahrscheinlich auch mit einem http post
    //wenn abgelehnt kommt eine error message
    /*'this.http.post("http://localhost:8080/auth/verify", verificationData).subscribe({
    next: (response: any) =>{
      this.router.navigate(['/login']);
    },
    error: (err) => {
      this.errorMessage = "Der Code ist falsch. Bitte richtig eingeben."
    }
    }); */

    //zum testen den token ausgeben
    // console.log(localStorage.getItem('jwt'));



    this.http.post('http://localhost:8080/auth/verify', {  username: this.username,
      code: this.code
    }, { headers: { 'Content-Type': 'application/json' }, responseType: 'text' }).subscribe({
      next: (token) => {
        // token speichern
        localStorage.setItem('jwt', token);
        this.router.navigate(['/']); // Weiterleiten (eigentlich zur startseite aber zum testen zurück zum login)
      },
      error: (err) => {
        this.errorMessage = 'Verifizierung fehlgeschlagen: ' + err.error; //error nachrichten vom backend
      }
    });


  }

}
