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
  sysAuthStatus$ = new BehaviorSubject<boolean>(false);
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
    }, 5000);

    this.sysAuthStatus$.subscribe(v => {
      if (!v) {
        // this.getUserInfo();
      }
    });
  }
  async getUserInfo() {
    const info = await Channel.exec<SysUserInfo>('account.getUserInfo');

    if (info.IsLoggedIn) {
      this.auth.logout();
    }
  }
}
