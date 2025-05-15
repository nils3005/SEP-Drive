import {Component, computed, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {UserService} from "../../services/user/user.service";
import {FormsModule} from "@angular/forms";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {User} from "../../types";
import {Subject, switchMap, takeUntil} from "rxjs";

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    FontAwesomeModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private destroy = new Subject<void>();

  user = signal<User | null>(null);

  ngOnInit(): void {
    this.route.paramMap
        .pipe(
            takeUntil(this.destroy),
            switchMap(params => {
              const id = Number(params.get('id'));
              return this.userService.getUserById(id);
            })
        )
        .subscribe({
          next: u => this.user.set(u),
          error: err => console.error('Fehler beim Laden des Profils:', err)
        });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  averageRating = computed(() => {
    const u = this.user();
    if (!u || !u.ratings?.length) {
      return 0;
    }
    const sum = u.ratings.reduce((acc, cur) => acc + cur, 0);
    return sum / u.ratings.length;
  });

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
