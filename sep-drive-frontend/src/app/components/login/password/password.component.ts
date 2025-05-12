import { Component } from '@angular/core';
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
  password: string = '';
  //hier der username der vorher eingegeben wurde
  username: string = history.state.username;
  errorMessage: string = "";


  constructor(private http: HttpClient,
              private router: Router) {
  }


  onSignIn() {
    const loginData = {
      username: this.username,
      password: this.password
    };

    //navigationstest
    //this.router.navigate(['/authentication']);

   /* this.http.post('http://localhost:8080/auth/login', loginData, { responseType: 'text' })
      .subscribe(response => {
        console.log('Antwort:', response);
      }); */

    //gehe zur authenticationseite

    //login daten werden an das backend geschickt

    this.http.post('http://localhost:8080/auth/login', loginData, {responseType: 'text'}).subscribe({
      //wenn angenommen, dann navigiere zur nächsten seite
      next: (response: any) => {
        //hier soll noch eine e-mail mit dem verification code geschickt werden
        this.router.navigate(['authentication'], { state: { username: this.username } }); // oder zur authentication seite navigieren
      },
      //error Message, später in html
      error: (err) => {
        this.errorMessage = 'Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.';
      }
    });


  }
}
