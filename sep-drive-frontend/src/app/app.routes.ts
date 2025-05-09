import { Routes } from '@angular/router';
import {SocialComponent} from "./components/social/social.component";
import {LoginComponent} from "./components/login/login.component";
import {ProfileComponent} from "./components/profile/profile.component";
import {LogoutComponent} from "./components/logout/logout.component";
import {RouteInputComponent} from './components/route-input/route-input.component';

export const routes: Routes = [
    { path: '', component: RouteInputComponent },
    { path: 'social', component: SocialComponent },
    { path: 'login', component: LoginComponent },
    { path: 'logout', component: LogoutComponent },
    { path: 'profile', component: ProfileComponent },
    { path: '**', redirectTo: '' } // Fallback, falls keine Route passt
];
