import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SystemGuardService {
  constructor(private router: Router) {}
  canActivate() {
    if (environment.authorizationState > 2) {
      return true;
    } else {
      this.router.navigate(['error']);
      return false;
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
