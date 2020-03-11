import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthorizationState } from './authorizationState';
@Injectable({
  providedIn: 'root',
})
export class SystemGuardService {
  constructor(private router: Router, private auth: AuthService) {}
  AuthorizationState = AuthorizationState;
  canActivate() {
    if (!this.AuthorizationState.includes(environment.authorizationState)) {
      this.router.navigate(['my/apps']);
      this.auth.login();
      return false;
    } else {
      return true;
    }
  }
}
