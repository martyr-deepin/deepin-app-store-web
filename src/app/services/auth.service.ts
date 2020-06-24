import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map, first, startWith, throttleTime } from 'rxjs/operators';
import { Router } from '@angular/router';

import { DstoreObject } from 'app/modules/client/utils/dstore-objects';
import { Channel } from 'app/modules/client/utils/channel';
import { environment } from 'environments/environment';
import { UnauthorizedService } from './unauthorized.service';
import { AuthorizationState } from './authorizationState';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router, private unauthorized: UnauthorizedService) {
    // this.init();
  }
  private userInfo$ = new BehaviorSubject<UserInfo>(undefined);
  info$ = this.userInfo$.asObservable();
  logged$ = this.info$.pipe(map(Boolean));
  AuthorizationState = AuthorizationState;
  // 初始化
  async init() {
    console.log('auth init');
    if (!environment.native || !environment.supportSignIn) {
      this.userInfo$.next(null);
      return;
    }
    await this.getInfo();
    Channel.connect('account.requestLogin').subscribe(() => {
      console.log('requestLogin，profile login');
      this.login();
    });
    Channel.connect('account.onAuthorized').subscribe(([code, state]) => this.auth(code, state));
    const userInfo = await Channel.exec('account.getUserInfo');
    Channel.connect('account.userInfoChanged')
      .pipe(startWith(userInfo))
      .subscribe(async ({ UserID }) => {
        console.log('user changed', UserID);
        if (!UserID) {
          this.logout();
          return;
        }
        const info = await this.userInfo$.pipe(first()).toPromise();
        if (!info || info.uid !== UserID) {
          this.logout();
          await this.login();
        }
      });
  }
  // 登录方法
  async login() {
    if (!environment.supportSignIn) {
      return;
    }
    interface LoginResult {
      client_id: string;
      scopes: string[];
      state: string;
    }
    const result = await this.http.post<LoginResult>('/api/user/login', null).toPromise();

    Channel.exec(
      'account.authorize',
      result.client_id,
      result.scopes,
      environment.server + '/api/user/login',
      result.state,
    );
  }

  // 验证登录接口
  private async auth(code: string, state: string) {
    const result = await this.http
      .get<{ jwt_token: string }>('/api/user/login', { params: { code, state } })
      .toPromise();
    console.log(result);
    localStorage.setItem('token', result.jwt_token);
    location.reload();
  }
  // 获取商店用户信息
  private async getInfo() {
    try {
      const sysUserInfo = await Channel.exec<SysUserInfo>('account.getUserInfo');
      if (sysUserInfo.IsLoggedIn) {
        const resp = await this.http.get<UserInfo>('/api/user/info').toPromise();
        this.userInfo$.next(resp);
      } else {
        this.userInfo$.next(null);
      }
    } catch (err) {
      console.error('login error', err);
    }
  }

  // 登出商店用户
  async logout(accountLogout = false) {
    const logged = Boolean(await this.userInfo$.pipe(first()).toPromise());
    localStorage.removeItem('token');
    this.userInfo$.next(null);

    if (accountLogout) {
      await this.accountLogout();
    }
    if (logged) {
      location.reload();
    }
  }
  // 登出系统用户
  accountLogout() {
    return Channel.exec('account.logout');
  }
  // 打开注册页面
  register() {
    DstoreObject.openURL(`https://account.chinauos.com/register`);
  }
}

export interface UserInfo {
  uid: number;
  username: string;
  nickname: string;
  profile_image: string;
  region: string;
}
export interface SysUserInfo {
  AccessToken: string;
  HardwareID: string;
  IsLoggedIn: boolean;
  Nickname: string;
  ProfileImage: string;
  Region: string;
  UserID: number;
  Username: string;
}
