import {Component, computed, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {UserService} from "../../services/user/user.service";
import {FormsModule} from "@angular/forms";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {switchMap} from "rxjs";
import {toSignal} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    FontAwesomeModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

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

  /**
   * @brief berechnet den Durchschnitt aller Ratings.
   *
   * @return signal vom Durchschnitt.
   */
  averageRating = computed(() => {
    const u = this.user();
    if (!u || !u.ratings?.length) {
      return 0;
    }
    const sum = u.ratings.reduce((acc, cur) => acc + cur, 0);
    return sum / u.ratings.length;
  });

  /**
   * @brief Gibt die CSS Klasse für den entsprechenden Durchschnitt zurück.
   *
   * @param rating - der Durchschnitt aller Ratings.
   * @param star - der Index des Sterns, dem eine CSS Klasse zugeordnet werden soll.
   *
   * @return die CSS Klasse von Fontawesome.
   */
  averageClass(rating: number, star: number): string {
    if (rating >= star) {
      return 'fas fa-star';                 // voller Stern
    } else if (rating >= star - 0.5) {
      return 'fas fa-star-half-alt';        // halber Stern
    } else {
      return 'far fa-star';                 // leerer Stern
    }
  }

}
