import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { map, switchMap, share, debounceTime, startWith } from 'rxjs/operators';
import { Software } from 'app/services/software.service';
import { RefundStatus } from 'app/services/refund.service';
import { RemoteAppService, RemoteApp } from './../../services/remote-app.service';
import { SysAuthService } from 'app/services/sys-auth.service';
import { MessageService, MessageType } from 'app/services/message.service';
import { StoreService } from 'app/modules/client/services/store.service';

@Component({
  selector: 'dstore-remote-app',
  templateUrl: './remote-app.component.html',
  styleUrls: ['./remote-app.component.scss'],
})
export class RemoteAppComponent implements OnInit {
  constructor(
    private route: ActivatedRoute, 
    public router: Router, 
    private remoteAppService: RemoteAppService,
    private SysAuth:SysAuthService,
    private storeService:StoreService,
    private messageService:MessageService
  ) {}
  readonly pageSize = 20;
  readonly RefundStatus = RefundStatus;
  free = true;
  pageIndex$ = this.route.queryParamMap.pipe(map(query => Number(query.get('page') || 0)));
  result$ = this.pageIndex$.pipe(
    switchMap(pageIndex =>
      this.messageService.onMessage(MessageType.AppsChange).pipe(
        startWith(null),
        debounceTime(100),
        map(() => {
          return pageIndex
        }),
      )
    ),
    switchMap(pageIndex => {
      let params = { offset: pageIndex * this.pageSize, limit: this.pageSize };

      if (this.free === false) {
        params['free'] = false;
      }
      return this.remoteAppService.list(params);
    }),
    share(),
  );
  sysAuthStatus$ = this.SysAuth.sysAuthStatus$;
  installed = new Set<string>();
  apps$ = this.result$.pipe(map(result => {
    return result.items
  }));
  count$ = this.result$.pipe(map(result => Math.ceil(result.count / this.pageSize)));
  installing$ = this.remoteAppService.installingList().pipe(
    map(v => {
      //初始化安装中的列表
      if(this.installed.size === 0) {
        v.forEach(name=>this.installed.add(name))
      }
      return v;
    }),
  );
  refund: RemoteApp = null;
  ngOnInit() {
    // this.route.queryParamMap.pipe(() => this.refresh$).subscribe(v => console.log('teest', v));
    // this.refresh$.subscribe(v => console.log('refresh subscribe'))
  }

  installApp(soft: Software) {
    this.installed.add(soft.package_name);

    this.remoteAppService.installApps([soft]);
  }
  gotoPage(pageIndex: number) {
    this.router.navigate([], { queryParams: { page: pageIndex } });
  }
  freeChange(free: boolean) {
    this.free = free;
    this.router.navigate([], { queryParams: { page: 0, free: this.free } });
  }

  refundeds:number[]=[];
  refunding(app_id:number){
    this.refundeds.push(app_id)
  }

  sysAuthMessage() {
    this.SysAuth.authorizationNotify();
  }
}
