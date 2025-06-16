import {Component, effect, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth/auth-service.service';
import {UserService} from '../../services/user/user.service';
import {ErrorService} from '../../services/error/error.service';
import {paymentMethodCustomer, paymentMethodDriver, User} from '../../types';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-payment-method',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './payment-method.component.html',
  styleUrl: './payment-method.component.scss'
})
export class PaymentMethodComponent {
  auth = inject(AuthService);
  private userService = inject(UserService);
  private errorMessage = inject(ErrorService);

  user = signal<User|null>(null);
  constructor(private router: Router) {
    effect(() => {
      this.user.set(this.auth.user());
    });
  }

  paymentMethodCustomerData: paymentMethodCustomer = {
    firstName: '',
    lastName: '',
    creditCardNumber: '',
    expiryDate: '',
    cvc: ''
  };

  paymentMethodDriverData: paymentMethodDriver = {
    firstName: '',
    lastName: '',
    iban: ''
  };

  onSubmit() {
    const currentUser = this.user();

    if (!currentUser) {
      this.errorMessage.showError("Kein Benutzer eingeloggt.");
      return;
    }

    if (currentUser.role === 'CUSTOMER') {
      const data = this.paymentMethodCustomerData;

      if (data.creditCardNumber.length !== 16) {
        this.errorMessage.showError("Die Kreditkartennummer muss genau 16 Zeichen lang sein.");
        return;
      }

      const expiryParts = data.expiryDate.split("-");
      const expiryInt = parseInt(expiryParts[0]) * 100 + parseInt(expiryParts[1]);
      const now = new Date();
      const nowInt = now.getFullYear() * 100 + (now.getMonth() + 1);

      if (expiryInt <= nowInt) {
        this.errorMessage.showError("Das Ablaufdatum muss in der Zukunft liegen.");
        return;
      }

      if (data.cvc.length < 3 || data.cvc.length > 3) {
        this.errorMessage.showError("CVC muss 3 Zeichen lang sein.");
        return;
      }

      const dto = {
        cardNumber: data.creditCardNumber,
        expiryDate: expiryInt,
        cvc: data.cvc
      };

      this.userService.addCreditCard(dto).subscribe({
        next: () => {
          this.errorMessage.showError("Zahlungsmethode erfolgreich gespeichert.");
          this.router.navigate(['/social/user', this.user()?.id]);
        },
        error: err => this.errorMessage.showError("Fehler beim Speichern der Kreditkarte: " + err.error.message)
      });

    } else if (currentUser.role === 'DRIVER') {
      const data = this.paymentMethodDriverData;

      if (data.iban.length !== 22) {
        this.errorMessage.showError("Die IBAN muss genau 22 Zeichen lang sein.");
        return;
      }

      const dto = {
        iban: data.iban
      };

      this.userService.addBankAccount(dto).subscribe({
        next: () => {
          this.errorMessage.showError("Bankkonto erfolgreich gespeichert.");
          this.router.navigate(['/social/user', this.user()?.id]);
        },
        error: err => this.errorMessage.showError("Fehler beim Speichern des Bankkontos: " + err.error.message)
      });

    } else {
      this.errorMessage.showError("Unbekannte Rolle.");
    }
  }
}
