import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { switchMap, share, map, distinctUntilChanged, publishReplay, refCount, first } from 'rxjs/operators';

import { RemoteAppService } from './../../services/remote-app.service';
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

  pageIndex$ = new BehaviorSubject<number>(0);
  result$ = this.pageIndex$.pipe(
    distinctUntilChanged(),
    switchMap(pageIndex => {
      let params = { offset: pageIndex * this.pageSize, limit: this.pageSize };
      if (this.free === false) {
        params['free'] = false;
      }
      return this.remoteAppService.list(params);
    }),
    publishReplay(1),
    refCount(),
  );
  length$ = this.result$.pipe(map(result => result.count));
  apps$ = this.result$.pipe(
    map(result => 
      result.items.map(apps => apps.soft)
    ),
    share(),
  );
  sysAuthStatus$ = this.sysAuthService.sysAuthStatus$;

  private jobList:string[]=[];

  async show() {
    this.batchInstall.clear();
    let jobsinfo = await this.jobService.jobsInfo().pipe(first()).toPromise()
    this.jobList = jobsinfo.map(jobinfo=>jobinfo.names[0])
    this.dialogRef.nativeElement.showModal();
  }
  hide() {
    this.dialogRef.nativeElement.close();
  }
  unavailable(app: Software) {
    return !app.package.remoteVersion || !app.active || app.unavailable || app.package.localVersion !== '' || this.jobList.includes(app.package_name)
      ? true
      : false;
  }
  

  touch(app: Software) {
    if (this.unavailable(app)) {
      return;
    }
    if (this.batchInstall.has(app.name)) {
      this.batchInstall.delete(app.name);
    } else {
      this.batchInstall.set(app.name, app);
    }
  }
  touchPage(apps: Software[]) {
    apps.forEach(app => {
      this.touch(app);
    });
  }
  selectPage(apps: Software[]) {
    apps.filter(app => !this.unavailable(app)).forEach(app => this.batchInstall.set(app.name, app));
  }
  installAll() {
    this.remoteAppService.installApps([...this.batchInstall.values()]);
    this.hide();
  }
  sysAuthMessage() {
    this.sysAuthService.authorizationNotify();
  }
}
