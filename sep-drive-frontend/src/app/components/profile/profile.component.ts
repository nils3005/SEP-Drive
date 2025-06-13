import {Component, computed, inject} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {UserService} from "../../services/user/user.service";
import {FormsModule} from "@angular/forms";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {switchMap} from "rxjs";
import {toSignal} from "@angular/core/rxjs-interop";
import {AuthService} from "../../services/auth/auth-service.service";
import {NgIf} from '@angular/common';
import {Router} from '@angular/router';



@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    FontAwesomeModule,
    NgIf
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private router: Router = inject(Router)
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  auth: AuthService = inject(AuthService);

  // Macht aus dem RxJS-Observable ein Angular Signal
  user = toSignal(
      this.route.paramMap.pipe(
          switchMap(params => this.userService.getUserById(
              // Wandelt die Pathvariable id von social/user/{id} in type number um
              +params.get('id')!

          ))
      ),
      { initialValue: null }
  );
  ownProfile = computed(() => {
    const current = this.auth.user();
    const profile = this.user();



    return !!current && !!profile && current.id === profile.id;
  });
  /**
   * @brief Gibt die CSS Klasse für den entsprechenden Durchschnitt zurück.
   *
   * @param rating - der Durchschnitt aller Ratings.
   * @param star - der Index des Sterns, dem eine CSS Klasse zugeordnet werden soll.
   *
   * @return die CSS Klasse von Fontawesome.
   */
  averageClass(star: number): string {
    if (this.user()!.rating >= star) {
      return 'fas fa-star';                 // voller Stern
    } else if (this.user()!.rating >= star - 0.5) {
      return 'fas fa-star-half-alt';        // halber Stern
    } else {
      return 'far fa-star';                 // leerer Stern
    }
  }
  paymentMethod(): void {
    this.router.navigate(['/payment-method']);
  }

  balance() {
    this.router.navigate(['/balance']);
  }
  drivinghistory() {
    this.router.navigate(['/history']);
  }


}
