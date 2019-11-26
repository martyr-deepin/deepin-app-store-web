import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { map, first, startWith, throttleTime } from 'rxjs/operators';
import { Router } from '@angular/router';

import { DstoreObject } from 'app/modules/client/utils/dstore-objects';
import { Channel } from 'app/modules/client/utils/channel';
import { environment } from 'environments/environment';
import { UnauthorizedService } from './unauthorized.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router, private unauthorized: UnauthorizedService) {
    this.init();
  }
  private userInfo$ = new BehaviorSubject<UserInfo>(null);
  info$ = this.userInfo$.asObservable();
  logged$ = this.info$.pipe(map(Boolean));
  // 初始化
  async init() {
    await this.getInfo();
    Channel.connect('account.requestLogin').subscribe(() => {
      this.login();
    });
    Channel.connect('account.onAuthorized').subscribe(([code, state]) => this.auth(code, state));
    this.unauthorized.unauthorized$.pipe(throttleTime(1000)).subscribe(() => {
      this.login();
    });
    const userInfo = await Channel.exec('account.getUserInfo');
    console.log({ userInfo });
    Channel.connect('account.userInfoChanged')
      .pipe(startWith(userInfo))
      .subscribe(async ({ UserID }) => {
        console.log('user changed', UserID);
        if (!UserID) {
          this.logout();
          return;
        }
        const info = await this.userInfo$.pipe(first()).toPromise();
        console.log(info);
        if (!info || info.uid !== UserID) {
          this.logout();
          await this.login();
        }
      });
  }
  // 登录方法
  async login() {
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
    localStorage.setItem('token', result.jwt_token);
    location.reload();
  }
  // 获取商店用户信息
  private async getInfo() {
    try {
      const sysUserInfo = await Channel.exec('account.getUserInfo');
      console.log({ sysUserInfo });
      const resp = await this.http.get<UserInfo>('/api/user/info').toPromise();
      this.userInfo$.next(resp);
    } catch {}
  }
  // 登出商店用户
  logout(accountLogout = false) {
    localStorage.removeItem('token');
    this.userInfo$.next(null);
    if (accountLogout) {
      return this.accountLogout();
    }
  }
  // 登出系统用户
  accountLogout() {
    return Channel.exec('account.logout');
  }
  // 打开注册页面
  register() {
    DstoreObject.openURL(`https://account.deepin.org/register`);
  }
}

export interface UserInfo {
  uid: number;
  username: string;
  nickname: string;
  profile_image: string;
  region: string;
}
