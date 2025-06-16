import {Component, effect, inject, signal} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {AuthService} from '../../services/auth/auth-service.service';
import {UserService} from '../../services/user/user.service';
import {ErrorService} from '../../services/error/error.service';
import {Router} from '@angular/router';
import {User, Balance} from '../../types';

@Component({
  selector: 'app-balance',
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './balance.component.html',
  styleUrl: './balance.component.scss'
})
export class BalanceComponent {
  auth = inject(AuthService);
  private userService = inject(UserService);
  private errorMessage = inject(ErrorService);

  balance: Balance ={
    balance: 0
  }
  blockMinus(event: KeyboardEvent) {
    if (event.key === '-') {
      event.preventDefault();
    }
  }


  user = signal<User|null>(null);
  constructor(private router: Router) {
    effect(() => {
      this.user.set(this.auth.user());
    });
  }

  onSubmit() {
    const currentUser = this.user();

    console.log(currentUser);

    if (!currentUser) {
      this.errorMessage.showError("Kein Benutzer eingeloggt.");
      return;
    }

    if (currentUser.role === 'CUSTOMER') {
      if(!this.user()?.financials.lastFourCreditCardNumber){
        this.errorMessage.showError("Keine Zahlungsmethode hinterlegt");
        this.router.navigate(['payment-method']);
        return;
      }
      if (this.balance.balance > 1000){
        this.errorMessage.showError("Zu hoher Betrag. Bitte wähle einen Betrag unter 1000€");
      }
      this.userService.deposit(this.balance.balance).subscribe({
        next: () => {
          this.errorMessage.showError("Guthaben wurde erfolgreich aufgeladen");
          this.auth.updateUserData();
          this.router.navigate(['/social/user', this.user()?.id]);
        },
        error: err => this.errorMessage.showError("Fehler beim Aufladen : " + err.error.message)
      });

    } else if (currentUser.role === 'DRIVER') {
      if(!this.user()?.financials.lastFourIban){
        this.errorMessage.showError("Keine Zahlungsmethode hinterlegt");
        this.router.navigate(['payment-method']);
        return;
      }
      if (this.balance.balance <= 0) {
        this.errorMessage.showError("Betrag muss größer als 0 sein.");
        return;
      }


      const userBalance = this.user()?.financials.balance;

      // @ts-ignore
      if (this.balance.balance > userBalance) {
        this.errorMessage.showError("Nicht genügend Guthaben auf dem Konto.");
        return;
      }
      this.userService.disburse(this.balance.balance).subscribe({
        next: () => {
          this.errorMessage.showError("Guthaben wurde erfolgreich abgebucht"),
            this.router.navigate(['/social/user', this.user()?.id]);
        },
        error: err => this.errorMessage.showError("Fehler bei der Abbuchung: " + err.error.message)
      });

    } else {
      this.errorMessage.showError("Unbekannte Rolle.");
    }
  }
}
