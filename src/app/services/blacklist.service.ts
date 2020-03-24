import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BlacklistOperation, BlacklistData } from './blacklist';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BlacklistService {
  constructor(private http: HttpClient) {}
  private blacklist$ = this.http
    .get<{ blacklist: BlacklistData[] }>('http://store-chinauos.sndu.cn/api/public/settings')
    .toPromise()
    .then(resp => resp.blacklist);
  async blacklist() {
    try {
      const list = await this.blacklist$;
      const ids = list
        .filter(data => {
          const match = data.match || {};
          const keys = Object.keys(match);
          return keys.length && keys.every(key => match[key] === environment.store_env[key]);
        })
        .reduce((acc, data) => [...acc, ...data.ids.map(id => [id, data.operation])], []);
      console.error('blacklist', ids);
      return new Map(ids as [number, BlacklistOperation][]);
    } catch (err) {
      console.error(err);
      return new Map<number, BlacklistOperation>();
    }
  }
}

const TestData: BlacklistData[] = [
  {
    match: {
      language: 'en_US',
    },
    ids: [1, 2, 3],
    operation: BlacklistOperation.Hidden,
  },
  {
    match: {
      language: 'zh_CN',
    },
    ids: [4, 5, 6, 43],
    operation: BlacklistOperation.Hidden,
  },
  {
    match: {
      display: 'x11',
    },
    ids: [6, 7, 9, 68],
    operation: BlacklistOperation.Disable,
  },
];
