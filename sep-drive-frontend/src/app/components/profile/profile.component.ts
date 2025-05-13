import {Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {UserServiceService} from "../../services/user/user-service.service";
import {FormsModule} from "@angular/forms";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {User} from "../../types";

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
  private userService = inject(UserServiceService);

  user = signal<User | null>(null);

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

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.userService.getUserById(id).subscribe(u => {
      if (u) {
        this.user.set(u);
      }
    });
  }
}
