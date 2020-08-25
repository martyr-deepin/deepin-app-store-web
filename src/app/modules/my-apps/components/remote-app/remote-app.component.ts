import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map, switchMap, share, debounceTime, startWith, scan, first, tap } from 'rxjs/operators';
import { Software } from 'app/services/software.service';
import { RefundStatus } from 'app/services/refund.service';
import { RemoteAppService, RemoteApp } from './../../services/remote-app.service';
import { SysAuthService } from 'app/services/sys-auth.service';
import { MessageService, MessageType } from 'app/services/message.service';
import { MyUpdatesService } from 'app/modules/my-updates/services/my-updates.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'dstore-remote-app',
  templateUrl: './remote-app.component.html',
  styleUrls: ['./remote-app.component.scss'],
})
export class RemoteAppComponent implements OnInit {
  constructor(
    public router: Router,
    private remoteAppService: RemoteAppService,
    private SysAuth: SysAuthService,
    private messageService: MessageService,
    private myUpdateService: MyUpdatesService,
  ) {}
  readonly pageSize = 20;
  readonly RefundStatus = RefundStatus;
  free = true;
  loading$ = new BehaviorSubject(false);
  offset$ = new BehaviorSubject(0);
  reload = false;

  result$ = this.offset$.pipe(
    tap((offset) => {
      if (offset > 0) {
        this.loading$.next(true);
      }
    }),
    switchMap((offset) =>
      this.messageService.onMessage(MessageType.AppsChange).pipe(
        startWith(null),
        debounceTime(100),
        map(() => {
          return offset;
        }),
      ),
    ),
    switchMap((offset) => {
      let params = { offset: offset, limit : this.pageSize };
      if (this.free === false) {
        params['free'] = false;
      }
      return this.remoteAppService.list(params);
    }),
    scan((acc, value) => {
      if(!this.reload) {
        value.items = acc.items.concat(value.items);
      }
      this.reload = false;
      return value;
    }),
    tap(() => (this.loading$.next(false))),
    share(),
  );
  sysAuthStatus$ = this.SysAuth.sysAuthStatus$;
  installed = new Set<string>();
  apps$ = this.result$.pipe(
    map((result) => {
      return result.items;
    }),
  );
  installing$ = this.remoteAppService.installingList().pipe(
    map((v) => {
      //初始化安装中的列表
      if (this.installed.size === 0) {
        v.forEach((name) => this.installed.add(name));
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
  updateApp(soft: Software) {
    this.myUpdateService.updatings.set(soft.package_name, soft);
    this.installApp(soft);
  }
  gotoPage(pageIndex: number) {
    this.router.navigate([], { queryParams: { page: pageIndex } });
  }
  freeChange(free: boolean) {
    this.free = free;
    this.reload = true;
    this.offset$.next(0);
  }

  refundeds: number[] = [];
  refunding(app_id: number) {
    this.refundeds.push(app_id);
  }

  sysAuthMessage() {
    this.SysAuth.authorizationNotify();
  }
  intersecting(bottom: boolean) {
    if (bottom) {
      this.offset$.pipe(first()).subscribe((offset) => {
        this.offset$.next((offset += this.pageSize));
      });
    }
  }
}
