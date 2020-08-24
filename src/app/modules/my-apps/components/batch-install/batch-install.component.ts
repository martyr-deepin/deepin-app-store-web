import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { switchMap, share, map, distinctUntilChanged, publishReplay, refCount, first, tap, scan } from 'rxjs/operators';

import { RemoteAppService, RemoteApp } from './../../services/remote-app.service';
import { Software } from 'app/services/software.service';
import { JobService } from 'app/services/job.service';
import { SysAuthService } from 'app/services/sys-auth.service';

@Component({
  selector: 'dstore-batch-install',
  templateUrl: './batch-install.component.html',
  styleUrls: ['./batch-install.component.scss'],
})
export class BatchInstallComponent {
  constructor(
    private remoteAppService: RemoteAppService,
    private jobService: JobService,
    private sysAuthService: SysAuthService
  ) {}
  
  @Input() free = null;
  @ViewChild('dialog', { static: true })
  dialogRef: ElementRef<HTMLDialogElement>;
  pageSize = 20;
  batchInstall = new Map<string, Software>();

  offset$ = new BehaviorSubject<number>(0);
  showLoading = true;
  loading = false;
  result$ = this.offset$.pipe(
    distinctUntilChanged(),
    tap((offset)=>{
      if(offset>0) {
        this.loading = true;
      }
    }),
    switchMap(offset => {
      this.showLoading = true;
      let params = { offset: offset, limit: this.pageSize };
      if (this.free === false) {
        params['free'] = false;
      }
      return this.remoteAppService.list(params);
    }),
    scan((acc, value) => {
      value.items = acc.items.concat(value.items);
      return value;
    }),
    tap(()=>{
      this.loading = false;
    }),
    publishReplay(1),
    refCount(),
  );
  length$ = this.result$.pipe(map(result => result.count));
  apps$ = this.result$.pipe(
    map(result => {
      this.showLoading = false;
      return result.items
    }),
    share(),
  );
  sysAuthStatus$ = this.sysAuthService.sysAuthStatus$;

  private jobList:string[]=[];

  async show() {
    this.batchInstall.clear();
    let jobsinfo = await this.jobService.jobsInfo().pipe(first()).toPromise()
    this.jobList = jobsinfo.map(jobinfo=>jobinfo.names[0])
    this.offset$.next(0);
    this.dialogRef.nativeElement.showModal();
  }
  hide() {
    this.dialogRef.nativeElement.close();
  }
  unavailable(remote: RemoteApp) {
    const app = remote.soft;
    if(!app||remote.unavailable) return true;
    return !app.package.remoteVersion || !app.active || app.unavailable || app.package.localVersion !== '' || this.jobList.includes(app.package_name)
      ? true
      : false;
  }
  

  touch(remote: RemoteApp) {
    const app = remote.soft;
    if (this.unavailable(remote)) {
      return;
    }
    if (this.batchInstall.has(app.name)) {
      this.batchInstall.delete(app.name);
    } else {
      this.batchInstall.set(app.name, app);
    }
  }
  touchPage(apps: RemoteApp[]) {
    apps.forEach(app => {
      this.touch(app);
    });
  }
  selectPage(apps: RemoteApp[]) {
    apps.filter(app => !this.unavailable(app)).forEach(remote => this.batchInstall.set(remote.soft.name, remote.soft));
  }
  installAll() {
    this.remoteAppService.installApps([...this.batchInstall.values()]);
    this.hide();
  }
  sysAuthMessage() {
    this.sysAuthService.authorizationNotify();
  }

  intersecting(intersecting:boolean) {
    if(intersecting) {
      this.offset$.pipe(first()).subscribe(offset => {
        this.offset$.next(offset += this.pageSize)
      })
    }
  }
}
