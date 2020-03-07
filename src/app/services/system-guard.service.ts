import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthorizationState } from './authorizationState';
@Injectable({
  providedIn: 'root',
})
export class SystemGuardService {
  AuthorizationState = AuthorizationState;
  constructor(private router: Router, private auth: AuthService) {}
  canActivate() {
    if (environment.authorizationState === this.AuthorizationState.Notauthorized) {
      this.router.navigate(['my/apps']);
      this.auth.login();
      return false;
    } else {
      return true;
    }
  }
}
