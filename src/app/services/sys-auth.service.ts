import { Injectable, NgZone } from '@angular/core';
import { AuthorizationState } from './authorizationState';
import { BehaviorSubject } from 'rxjs';
import { Channel } from 'app/modules/client/utils/channel';
import { AuthService, SysUserInfo } from './auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SysAuthService {
  sysAuthStatus$ = new BehaviorSubject(true);
  AuthorizationState = AuthorizationState;
  getAuthorizationState() {}
  constructor(zone: NgZone, private auth: AuthService) {
    (window as any).setAuthorized = state => {
      zone.run(() => {
        this.sysAuthStatus$.next(state);
      });
    };
    setInterval(() => {
      Channel.exec<number>('settings.getAuthorizationState').then(v => {
        if (this.AuthorizationState.includes(v)) {
          this.sysAuthStatus$.next(true);
        } else {
          this.sysAuthStatus$.next(false);
        }
      });
    }, 10000);

    this.sysAuthStatus$.subscribe(v => {
      if (!v) {
        // this.getUserInfo();
      }
    });
  }
  authorizationNotify() {
    Channel.exec('account.authorizationNotify', 5000);
  }
  async getUserInfo() {
    const info = await Channel.exec<SysUserInfo>('account.getUserInfo');

    if (info.IsLoggedIn) {
      this.auth.logout();
    }
  }
  setSysAuthMessage() {
    Channel.exec('account.getUserInfo');
  }
}
