import { Routes } from '@angular/router';
import { LoginComponent} from './components/login/login.component';
import { PasswordComponent} from './components/login/password/password.component';
import {AuthenticationComponent} from './components/login/password/authentication/authentication.component';
import {SupercodeComponent} from './components/login/password/authentication/supercode/supercode.component';

export const routes: Routes = [{ path: 'login', component: LoginComponent },
  { path: 'password', component: PasswordComponent },
  {path: 'authentication', component: AuthenticationComponent},
  {path: 'supercode', component: SupercodeComponent},
  { path: '', component: HomePageComponent },
  { path: 'social', component: SocialComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '' }];
