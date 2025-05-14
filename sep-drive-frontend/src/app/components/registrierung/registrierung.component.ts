import {Component, inject, Input} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DriveUser} from '../../types';
import {NgIf} from '@angular/common';
import {Router} from '@angular/router';
import {ErrorService} from "../../services/error/error.service";

@Component({
  selector: 'app-registrierung',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './registrierung.component.html',
  styleUrl: './registrierung.component.scss'
})


export class RegistrierungComponent {
  @Input() username: any;
  @Input() firstName: any;
  @Input() lastName: any;
  @Input() rolle: any;
  @Input() email: any;
  @Input() birthDate: any;
  @Input() password: any;
  @Input() wdhpasswort: any;
  @Input() profilePicture: any;
  @Input() carType: any;

  private errorMessage = inject(ErrorService);

  private http = inject(HttpClient);
  registrierungsUser: DriveUser;





  constructor(private router: Router) {
    this.registrierungsUser = {
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      rolle: this.rolle,
      birthDate: this.birthDate,
      password: this.password,
      wdhpasswort: this.wdhpasswort,
      profilePicture: this.profilePicture,
      carType: this.carType,
    }

  }
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.registrierungsUser.profilePicture = (reader.result as string).split(',')[1];
      };
      reader.readAsDataURL(file);
    }
  }
  onSubmit() {
    const regex = /.*@.*\..*/;

    // @ts-ignore
    const email :string= this.registrierungsUser.email;

    if(regex.exec(email)==null){
      this.errorMessage.showError("Fehler: E-Mail ungültig!")
    }
    else if(/[äöüÄÖÜß]/.test(this.registrierungsUser.email)){
      this.errorMessage.showError('Die eingegebene E-Mail enthält unerlaubte Zeichen (Umlaute)!')
    }
    else if (this.registrierungsUser.password!=this.registrierungsUser.wdhpasswort){
      this.errorMessage.showError ('Die eingegebenen Passwörter stimmen nicht überein!');
    }
    else{
      this.http.post('http://localhost:8080/auth/register',
        {
          username: this.registrierungsUser.username,
          firstName: this.registrierungsUser.firstName,
          lastName: this.registrierungsUser.lastName,
          email: this.registrierungsUser.email,
          role: this.registrierungsUser.rolle,
          birthDate: this.registrierungsUser.birthDate,
          password: this.registrierungsUser.password,
          profilePicture: this.registrierungsUser.profilePicture,
          carType: this.registrierungsUser.carType
        },
        {
          //headers: new HttpHeaders({"Content-Type": "application/json"}),
          responseType: 'text'
        }
      ).subscribe({
        next: () => {
          console.log("Registrierung erfolgreich")
          this.router.navigate(['/login'])
        },
        error: (error) => {
          console.log(error);
          this.errorMessage.showError (error.error);
        }
      });






    }
  }

}
