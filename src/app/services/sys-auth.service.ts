import { Injectable, NgZone } from '@angular/core';
import { AuthorizationState } from './authorizationState';
import { BehaviorSubject, merge, timer } from 'rxjs';
import { Channel } from 'app/modules/client/utils/channel';
import { AuthService } from './auth.service';
import { environment } from 'environments/environment';
import { StoreMode } from './storeMode';

@Injectable({
  providedIn: 'root',
})
export class SysAuthService {
  constructor(private zone: NgZone, private authService: AuthService) {
    this.storeMode = environment.appStoreType;
    this.init();
  }
  storeMode = -1;
  sysAuthStatus$ = new BehaviorSubject(true);
  AuthorizationState = AuthorizationState;
  intranetAuthNotifyType: NotifyType;
  noIntranetAuth$ = new BehaviorSubject(null);

  init() {
    (window as any).setAuthorized = (state: boolean) => {
      this.zone.run(() => this.sysAuthStatus$.next(state));
    };
    merge(Channel.connect('settings.authStateChanged'), timer(5000)).subscribe(() => {
      if (this.storeMode === StoreMode.IntranetAppStore) {
        this.getIntranetAuthState();
      }
      this.getAuthorizationState();
    });
    if (this.storeMode === StoreMode.IntranetAppStore) {
      this.getIntranetAuthState();
    }
    this.getAuthorizationState();
  }
  getAuthorizationState() {
    Channel.exec<number>('settings.getAuthorizationState').then((v) => {
      environment.authorizationState = v;
      if (this.AuthorizationState.includes(v)) {
        this.sysAuthStatus$.next(true);
      } else {
        this.sysAuthStatus$.next(false);
        this.intranetAuthNotifyType = NotifyType.ExtranetNotAuthorized;
      }
    });
  }
  authorizationNotify() {
    Channel.exec('account.authorizationNotify', this.intranetAuthNotifyType);
  }
  setAuthMessage() {
    this.authorizationNotify();
  }

  async getIntranetAuthState() {
    try {
      const resp = await Channel.exec<any>('settings.getIntranetAuthState');

      const result = JSON.parse(resp) as PrivateSignResult;

      // 注册状态
      console.log(result);
      let intranetAuthState = result.is_register;
      if (intranetAuthState !== true) {
        this.configIntranetAuthNotifyType(result);
        this.noIntranetAuth$.next(intranetAuthState);
        return;
      }
      //在注册mac地址成功的基础之上判断试用期状态
      intranetAuthState = this.configProbationFail(result.expire_result.code);
      this.noIntranetAuth$.next(intranetAuthState);
    } catch (e) {
      console.log('err', e);
      this.intranetAuthNotifyType = NotifyType.IntranetNotAuthorized;
      this.noIntranetAuth$.next(false);
    }
  }
  configProbationFail(code: number) {
    if (code === privateAuthType.IntranetTrialExpired) {
      this.intranetAuthNotifyType = NotifyType.IntranetTrialExpired;
      return false;
    } else {
      return true;
    }
  }
  notifyIntranetFail() {
    Channel.exec('account.authorizationNotify', this.intranetAuthNotifyType);
  }

  configIntranetAuthNotifyType(result: PrivateSignResult) {
    if (result.code === privateAuthType.IntranetExceedLimit) {
      this.intranetAuthNotifyType = NotifyType.IntranetExceedLimit;
    } else {
      this.intranetAuthNotifyType = NotifyType.IntranetNotAuthorized;
    }
  }
}

enum NotifyType {
  ExtranetNotAuthorized,
  IntranetNotAuthorized,
  IntranetExceedLimit,
  IntranetTrialExpired,
}
enum privateAuthType {
  IntranetExceedLimit = 40005,
  IntranetTrialExpired = 40004,
  IntranetSignSuccess = 10000,
}

interface PrivateSignResult {
  is_register: boolean;
  reg_time: number;
  reg_time_str: string;
  poll_interval: number;
  expire_result: Expireresult;
  code?: number;
}

interface Expireresult {
  code: number;
  msg: string;
  remainHours: number;
}
