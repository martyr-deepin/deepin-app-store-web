import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SystemGuardService {
  AuthorizationState = AuthorizationState;
  constructor(private router: Router) {}
  canActivate() {
    console.log(this.AuthorizationState);
    if (environment.authorizationState === this.AuthorizationState.Notauthorized) {
      this.router.navigate(['error']);
      return false;
    } else {
      return true;
    }
  }
}
enum AuthorizationState {
  Notauthorized, //未授权
  Authorized, //已授权
  Expired, //已过期
  TrialAuthorized, //试用期已授权
  TrialExpired, //试用期已过期
}
