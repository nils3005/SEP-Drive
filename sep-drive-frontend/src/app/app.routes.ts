import { Routes } from '@angular/router';
import { LoginComponent} from './components/login/login.component';
import { PasswordComponent} from './components/login/password/password.component';
import {AuthenticationComponent} from './components/login/password/authentication/authentication.component';
import {HomePageComponent} from './pages/home-page/home-page.component';
import {SocialComponent} from './components/social/social.component';
import {ProfileComponent} from './components/profile/profile.component';
import { RegistrierungComponent } from './components/registrierung/registrierung.component';
import {RideOffersComponent} from "./components/rideoffers/ride-offers.component";

export const routes: Routes = [{ path: 'login', component: LoginComponent },
  { path: 'password', component: PasswordComponent },
  { path: 'authentication', component: AuthenticationComponent},
  { path: 'register', component: RegistrierungComponent},
  { path: '', component: HomePageComponent },
  { path: 'social', component: SocialComponent },
  { path: 'social/user/:id', component: ProfileComponent },
  { path: 'ride-request/:rideRequestId/offers', component: RideOffersComponent},
  { path: '**', redirectTo: '' }];
