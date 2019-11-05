import { Injectable } from '@angular/core';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { get } from 'lodash';
import { Channel } from 'app/modules/client/utils/channel';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  store = get(window, 'dstore.channel.objects');
  constructor() {}
  private onRequestInstallApp() {
    return Channel.connect<[string, string]>('storeDaemon.requestInstallApp').pipe(
      map(args => {
        return { type: 'install', req_id: args[0], pkg_url: args[1] } as RequestBody;
      }),
    );
  }
  private onRequestUninstallApp() {
    return Channel.connect<[string, string]>('storeDaemon.requestUninstallApp').pipe(
      map(args => {
        return { type: 'uninstall', req_id: args[0], pkg_url: args[1] } as RequestBody;
      }),
    );
  }
  private onRequestUpdateApp() {
    return Channel.connect<[string, string]>('storeDaemon.requestUpdateApp').pipe(
      map(args => {
        return { type: 'update', req_id: args[0], pkg_url: args[1] } as RequestBody;
      }),
    );
  }
  private onRequestUpdateAllApp() {
    return Channel.connect<string>('storeDaemon.requestUpdateAllApp').pipe(
      map(args => {
        return { type: 'update_all', req_id: args } as RequestBody;
      }),
    );
  }
  onRequest() {
    return merge(
      this.onRequestInstallApp(),
      this.onRequestUninstallApp(),
      this.onRequestUpdateApp(),
      this.onRequestUpdateAllApp(),
    );
  }
  requestFinished(result: FinishedResult) {
    console.log('request finished');
    return Channel.exec('storeDaemon.onRequestFinished', { id: result.req_id, error_type: result.error_type });
  }
}
interface RequestBody {
  type: 'install' | 'uninstall' | 'update' | 'update_all';
  req_id: string;
  pkg_url?: string;
}
interface FinishedResult {
  req_id: string;
  error_type?: RequestErrorType;
}
export enum RequestErrorType {
  AppNotFound = 'app_not_found',
  NetworkError = 'network_error',
  AppIsLatest = 'app_is_latest',
  AppInstalled = 'app_installed',
  AppNotInstalled = 'app_not_installed',
}
