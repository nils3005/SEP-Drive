import {AfterViewInit, Component, ElementRef, inject, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {AuthService} from "../../services/auth/auth-service.service";

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements AfterViewInit{
    router: Router = inject(Router);
    http: HttpClient = inject(HttpClient);
    auth: AuthService = inject(AuthService);
  @ViewChild('usernameInput') usernameInput!: ElementRef<HTMLInputElement>;

    username: string ='';
    errorMessage: string='';

    onSignIn() {
        this.auth.checkUsername(this.username).subscribe({
            next: (_) => {
                this.router.navigate(['/password'], {
                    state: { username: this.username }
                });
            },
            error: (_) => {
                this.errorMessage = 'Der Benutzername existiert nicht.';
            }
        });
    }

  toRegister(){
    this.router.navigate(['/register']);
  }

  ngAfterViewInit(): void {
    this.usernameInput.nativeElement.focus();
  }


}
