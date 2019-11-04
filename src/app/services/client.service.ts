import { Injectable } from '@angular/core';
import { get } from 'lodash';
import { Channel } from 'app/modules/client/utils/channel';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  store = get(window, 'dstore.channel.objects');
  constructor() {}
  onRequestInstallApp() {
    return Channel.connect<[string, number]>('storeDaemon.requestInstallApp');
  }
  onRequestUninstallApp() {
    return Channel.connect<[string, number]>('storeDaemon.requestUninstallApp');
  }
  onRequestUpdateApp() {
    return Channel.connect<[string, number]>('storeDaemon.requestUpdateApp');
  }
  onRequestUpdateAllApp() {
    return Channel.connect<string>('storeDaemon.requestUpdateAllApp');
  }
  requestFinished(result: FinishedResult) {
    console.log('request finished');
    return Channel.exec('storeDaemon.onRequestFinished', result);
  }
}

interface FinishedResult {
  id: string;
  error_type?: RequestErrorType;
}
export enum RequestErrorType {
  AppNotFound = 'app_not_found',
  NetworkError = 'network_error',
  AppIsLatest = 'app_is_latest',
  AppInstalled = 'app_installed',
  AppNotInstalled = 'app_not_installed',
}
