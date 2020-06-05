import { Injectable, NgZone } from '@angular/core';
import { AuthorizationState } from './authorizationState';
import { BehaviorSubject, merge, timer } from 'rxjs';
import { Channel } from 'app/modules/client/utils/channel';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SysAuthService {
  constructor(private zone: NgZone) {
    this.init();
  }
  sysAuthStatus$ = new BehaviorSubject(true);
  AuthorizationState = AuthorizationState;
  init() {
    (window as any).setAuthorized = (state: boolean) => {
      this.zone.run(() => this.sysAuthStatus$.next(state));
    };
    //this.getAuthorizationState()
    merge(Channel.connect('settings.authStateChanged'), timer(1000, 10000)).subscribe(() => {
      this.getAuthorizationState()
    });
  }
  getAuthorizationState(){
    Channel.exec<number>('settings.getAuthorizationState').then(v => {
      environment.authorizationState=v
      if (this.AuthorizationState.includes(v)) {
        this.sysAuthStatus$.next(true);
      } else {
        this.sysAuthStatus$.next(false);
        //未授权，退出登录
        //this.authService.logout(true)
      }
    });
  }
  authorizationNotify() {
    Channel.exec('account.authorizationNotify', 5000);
  }
  setSysAuthMessage() {
    Channel.exec('account.getUserInfo');
  }
}
