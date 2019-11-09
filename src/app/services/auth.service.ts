import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { DstoreObject } from 'app/modules/client/utils/dstore-objects';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {
    this.getInfo();
  }
  private userInfo$ = new BehaviorSubject<UserInfo>(null);
  info$ = this.userInfo$.asObservable();
  logged$ = this.info$.pipe(map(Boolean));

  private get redirectURI() {
    return location.origin + '/login';
  }
  // 登录方法
  async login() {
    console.log('login');
    const url = new URL('http://test.login.deepinid.deepin.com/oauth2/authorize');
    url.searchParams.set('client_id', '852f47a2892181e47ca5413207020180677204e6');
    url.searchParams.set('redirect_uri', this.redirectURI);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'base,user:read,dstore');
    url.searchParams.set('state', Math.random().toString());
    location.href = url.toJSON();
  }
  async auth(code: string, state: string) {
    await this.http.get('/api/user/login', { params: { code, state, redirect_uri: this.redirectURI } }).toPromise();
    await this.getInfo();
  }
  private async getInfo() {
    const resp = await this.http.get<UserInfo>('/api/user/info').toPromise();
    this.userInfo$.next(resp);
  }
  // 登出方法
  async logout() {
    await this.http.get('/api/user/logout').toPromise();
    this.userInfo$.next(null);
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
