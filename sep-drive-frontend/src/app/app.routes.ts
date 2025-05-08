import { Routes } from '@angular/router';
import {RoutePlanningComponent} from "./components/route-planning/route-planning.component";
import {SocialComponent} from "./components/social/social.component";
import {LoginComponent} from "./components/login/login.component";
import {ProfileComponent} from "./components/profile/profile.component";

export const routes: Routes = [
    { path: '', component: RoutePlanningComponent },
    { path: 'social', component: SocialComponent },
    { path: 'login', component: LoginComponent },
    { path: 'logout', component: LoginComponent },
    { path: 'profile', component: ProfileComponent },
    { path: '**', redirectTo: '' } // Fallback, falls keine Route passt
];
