import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { once } from 'lodash';
import { BlacklistOperation, BlacklistData } from './blacklist';

@Injectable({
  providedIn: 'root',
})
export class BlacklistService {
  constructor(private http: HttpClient) {}
  readonly blacklist = once(this.blacklistParse);
  private async blacklistParse() {
    try {
      const settings = await this.http.get<{ blacklist: BlacklistData[] }>('/api/public/settings').toPromise();
      const list = await settings.blacklist;
      const ids = list
        .filter(data => {
          const match = data.match || {};
          const keys = Object.keys(match);
          return keys.length && keys.every(key => match[key] === environment.store_env[key]);
        })
        .reduce((acc, data) => [...acc, ...data.ids.map(id => [id, data.operation])], []);
      console.warn('[blacklist]', ids);
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
