import { Injectable } from '@angular/core';
import { Channel } from '../utils/channel';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

import { StoreJobInfo } from '../models/store-job-info';
import { AppPayStatus } from 'app/services/order.service';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  constructor() {}

  appPayStatus(payStatus: AppPayStatus) {
    return this.execWithCallback('storeDaemon.appPayStatus',payStatus)
  }

  isDBusConnected(): Observable<boolean> {
    return this.execWithCallback('storeDaemon.isDBusConnected');
  }

  fixError(errorType: string): Observable<string> {
    return this.execWithCallback('storeDaemon.fixError', errorType);
  }

  getJobList(): Observable<string[]> {
    return this.execWithCallback('storeDaemon.jobList');
  }

  getJobInfo(jobPath: string): Observable<StoreJobInfo> {
    return this.execWithCallback('storeDaemon.getJobInfo', jobPath);
  }

  getJobsInfo(jobPaths: string[]): Observable<StoreJobInfo[]> {
    return this.execWithCallback('storeDaemon.getJobsInfo', jobPaths);
  }

  getJobStatus(jobPath: string): Observable<StoreJobInfo> {
    return this.execWithCallback('storeDaemon.getJobStatus', jobPath);
  }

  jobListChange(): Observable<string[]> {
    return Channel.connect('storeDaemon.jobListChanged');
  }

  clearJob(job: string): void {
    Channel.exec('storeDaemon.cleanJob', job);
  }

  storeUpdate() {
    return this.execWithCallback<string>('storeDaemon.updateSourceList');
  }

  pauseJob(job: string): void {
    Channel.exec('storeDaemon.pauseJob', job);
  }

  resumeJob(job: string): void {
    Channel.exec('storeDaemon.startJob', job);
  }

  getAllowShowPackageName(): Promise<boolean> {
    return Channel.exec('settings.allowShowPackageName');
  }

  onMessage(): Observable<string> {
    return Channel.connect('websocket.onMsg')
  }

  newWebSocket(url:string) {
    return Channel.exec("websocket.newWebSocket",url);
  }

  InstalledPackages() {
    return this.execWithCallback<LocalApp[]>('storeDaemon.installedPackages');
  }

  queryDownloadSize(param: string[]) {
    return this.execWithCallback<QueryResult>('storeDaemon.queryDownloadSize', param).pipe(
      map(result => {
        const arr = Object.values(result).filter(r => r );
        return new Map(arr.map(pkg => [pkg.packageName, pkg.downloadSize]));
      }),
    );
  }
  query(opts: string[]) {
    return this.execWithCallback<QueryResult>('storeDaemon.query', opts).pipe(
      map(results => {
        const arr = opts.map(name => {
          const result = results[name];
          if (!result) {
            return [name, null] as [string, Package];
          }
          return [name, result] as [string, Package];
        });
        return new Map(arr);
      }),
    );
  }

  execWithCallback<T>(method: string, ...args: any[]): Observable<T> {
    return from(
      Channel.exec<StoreResponse>(method, ...args).then(resp => {
        return resp.ok ? resp.result : Promise.resolve(resp);
      }),
    );
  }
}

/**
 * Returned value from store daemon proxy dbus interface.
 */
class StoreResponse {
  ok: boolean;
  errorName: string;
  errorMsg: string;
  result: any;
}

interface QueryResult {
  [key: string]: Package
}
export interface Package {
  appName: string;
  packageName: string;
  packageURI: string;
  localVersion?: string;
  remoteVersion?: string;
  upgradable: boolean;
  installedTime: number;
  downloadSize: number;
  size: number;
}
export interface QueryParam {
  name: string;
  localName: string;
  packages: { packageURI: string }[];
}
export interface InstallParam {
  name: string;
  packageName: string;
}
export interface LocalApp {
  allLocalName: AllLocalName;
  appName: string;
  downloadSize: number;
  installedTime: number;
  localName: string;
  localVersion: string;
  packageName: string;
  packageURI: string;
  remoteVersion: string;
  size: number;
  upgradable: boolean;
  icon?: string;
}
interface AllLocalName {
  en_US: string;
  zh_CN: string;
}
