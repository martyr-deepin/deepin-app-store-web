import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { Router } from '@angular/router';

import { DstoreObject } from 'app/modules/client/utils/dstore-objects';
import { Channel } from 'app/modules/client/utils/channel';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {
    this.getInfo();
    Channel.connect('account.onAuthorized').subscribe(([code, state]) => this.auth(code, state));
    Channel.connect('account.userInfoChanged').subscribe(async ({ UserID }) => {
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
  private userInfo$ = new BehaviorSubject<UserInfo>(null);
  info$ = this.userInfo$.asObservable();
  logged$ = this.info$.pipe(map(Boolean));

  // 登录方法
  async login() {
    interface LoginResult {
      client_id: string;
      scopes: string[];
      state: string;
    }
    const result = await this.http.post<LoginResult>('/api/user/login', null).toPromise();
    this.authorize({
      clientID: result.client_id,
      scopes: result.scopes,
      state: result.state,
      callback: environment.server + '/api/user/login',
    });
  }

  async auth(code: string, state: string) {
    const result = await this.http
      .get<{ jwt_token: string }>('/api/user/login', { params: { code, state } })
      .toPromise();
    localStorage.setItem('token', result.jwt_token);
    await this.getInfo();
  }

  private async getInfo() {
    const resp = await this.http.get<UserInfo>('/api/user/info').toPromise();
    this.userInfo$.next(resp);
  }
  authorize(config: { clientID: string; scopes: string[]; callback: string; state: string }) {
    return Channel.exec('account.authorize', config.clientID, config.scopes, config.callback, config.state);
  }
  // 登出方法
  logout() {
    localStorage.removeItem('token');
    this.userInfo$.next(null);
  }
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
