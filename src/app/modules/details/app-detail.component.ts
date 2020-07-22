import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, map, startWith, publishReplay, refCount } from 'rxjs/operators';

import { StoreService } from 'app/modules/client/services/store.service';
import { StoreJobType, StoreJobStatus } from 'app/modules/client/models/store-job-info';
import { DstoreObject } from 'app/modules/client/utils/dstore-objects';
import { environment } from 'environments/environment';
import { SoftwareService, Source } from 'app/services/software.service';
import { SettingService } from 'app/services/settings.service';
import { DownloadTotalService } from 'app/services/download-total.service';
import { CommentService } from './services/comment.service';
import { SysAuthService } from 'app/services/sys-auth.service';

@Component({
  selector: 'dstore-app-detail',
  templateUrl: './app-detail.component.html',
  styleUrls: ['./app-detail.component.scss'],
})
export class AppDetailComponent{
  constructor(
    private route: ActivatedRoute,
    private softwareService: SoftwareService,
    private storeService: StoreService,
    private settingService: SettingService,
    private downloadTotalServer: DownloadTotalService,
    private comment: CommentService,
    private sysAuth: SysAuthService,
    private el: ElementRef
  ) {}

  crumbs = false;
  supportSignIn = environment.supportSignIn;
  adVisible$ = this.settingService.settings$.then(set => set.upyunBannerVisible);
  open = this.softwareService.open;
  sysAuthStatus$ = this.sysAuth.sysAuthStatus$;
  StoreJobStatus = StoreJobStatus;
  StoreJobType = StoreJobType;
  SoftSource = Source;

  openURL = DstoreObject.openURL;
  pause = this.storeService.pauseJob;
  start = this.storeService.resumeJob;

  installCount$ = this.downloadTotalServer.installCount$.pipe(
    map(app => (parseInt(this.route.snapshot.params.id) === app.id ? 1 : 0)),
    startWith(0),
  );
  sourceCount$ = this.comment.sourceCount$.pipe(map(app => parseInt(app)));
  app$ = this.route.paramMap.pipe(
    switchMap(param => this.softwareService.list({ ids: [Number(param.get('id'))] }).then(softs => softs[0])),
    publishReplay(1), 
    refCount(),
  );

  allowName$ = this.storeService.getAllowShowPackageName();

  description_overflow() {
    const nativeElement = this.el.nativeElement
    const log_content = nativeElement.querySelector('.description_content')
    return log_content?.scrollWidth > log_content?.clientWidth || false;
  }
}
