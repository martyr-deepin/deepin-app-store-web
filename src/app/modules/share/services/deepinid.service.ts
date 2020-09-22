import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, concat } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { chunk } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class DeepinidInfoService {
  private apiURL = '/api/public/dev';
  private oldApiURL = '/api/public/deepinid';
  constructor(private http: HttpClient) {}

  cache = new Map<number, DeepinInfo>();
  ids = new Set<number>();

  getDeepinUserInfo(uid: number): Observable<DeepinInfo>;
  getDeepinUserInfo(uidList: Array<number>): Observable<Array<DeepinInfo>>;

  getDeepinUserInfo(param: number | Array<number>) {
    if (typeof param === 'number') {
      return this.http.get<DeepinInfo>(this.apiURL, { params: { uid: param as any } }).pipe(
        catchError(err => {
          this.apiURL = this.oldApiURL;
          return this.http.get<DeepinInfo>(this.apiURL, { params: { uid: param as any } });
        })
      );
    }
    if (param instanceof Array) {
      const req = chunk(param, 20).map(ids => {
        return this.http.get<DeepinInfo[]>(this.apiURL, { params: { uid: ids.join(",") as any } }).pipe(
          catchError(err => {
            this.apiURL = this.oldApiURL;
            return this.http.get<DeepinInfo>(this.apiURL, { params: { uid: param as any } });
          })
        );
      });
      return concat(...req);
    }
  }
}

export interface DeepinInfo {
  avatar: string;
  nickname: string;
  profile_image: string;
  region: string;
  uid: number;
  username: string;
}
