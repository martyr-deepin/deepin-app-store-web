import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { concat, BehaviorSubject } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { throttle } from 'lodash';

import { DstoreObject } from 'app/modules/client/utils/dstore-objects';
import { Channel } from 'app/modules/client/utils/channel';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {
    this.login();
  }
  private userInfo$ = new BehaviorSubject<UserInfo>(null);
  info$ = this.userInfo$.asObservable();
  logged$ = this.info$.pipe(map(Boolean));
  // 登录方法
  async login() {
    console.log('login');
    const resp = await this.http.get<UserInfo>('/api/user/info').toPromise();
    console.log(resp);
    this.userInfo$.next(resp);
  }
  // 登出方法
  logout() {
    console.log('logout');
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
