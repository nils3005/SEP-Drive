import { Routes } from '@angular/router';
import {SocialComponent} from "./components/social/social.component";
import {LoginComponent} from "./components/login/login.component";
import {ProfileComponent} from "./components/profile/profile.component";
import {LogoutComponent} from "./components/logout/logout.component";
import {HomePageComponent} from './pages/home-page/home-page.component';

export const routes: Routes = [
    { path: '', component: HomePageComponent },
    { path: 'social', component: SocialComponent },
    { path: 'login', component: LoginComponent },
    { path: 'logout', component: LogoutComponent },
    { path: 'social/user/:id', component: ProfileComponent },
    { path: '**', redirectTo: '' } // Fallback, falls keine Route passt
];
