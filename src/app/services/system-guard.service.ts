import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

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
export enum AuthorizationState {
  Notauthorized, //未授权
  Authorized, //已授权
  Expired, //已过期
  TrialAuthorized, //试用期已授权
  TrialExpired, //试用期已过期
}
