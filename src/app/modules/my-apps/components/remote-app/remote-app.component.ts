import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { map, switchMap, share, retryWhen } from 'rxjs/operators';
import { Software } from 'app/services/software.service';
import { RefundStatus } from 'app/services/refund.service';
import { RemoteAppService, RemoteApp } from './../../services/remote-app.service';

@Component({
  selector: 'dstore-remote-app',
  templateUrl: './remote-app.component.html',
  styleUrls: ['./remote-app.component.scss'],
})
export class RemoteAppComponent implements OnInit {
  constructor(private route: ActivatedRoute, public router: Router, private remoteAppService: RemoteAppService) {}
  readonly pageSize = 12;
  readonly RefundStatus = RefundStatus;
  refresh$ = new BehaviorSubject(null);
  pageIndex$ = this.refresh$.pipe(
    switchMap(() => this.route.queryParamMap),
    map(query => Number(query.get('page')) || 0),
  );
  result$ = this.pageIndex$.pipe(
    switchMap(pageIndex => {
      console.log({ pageIndex });
      return this.remoteAppService.list({ offset: pageIndex * this.pageSize, limit: this.pageSize });
    }),
    share(),
  );
  installed = new Set<string>();
  apps$ = this.result$.pipe(map(result => result.items));
  count$ = this.result$.pipe(map(result => Math.ceil(result.count / this.pageSize)));
  installing$ = this.remoteAppService.installingList();
  refund: RemoteApp = null;
  ngOnInit() {
    this.route.queryParamMap.pipe(() => this.refresh$).subscribe(v => console.log('teest', v));
    this.refresh$.subscribe(v => console.log('refresh subscribe'));
  }

  installApp(soft: Software) {
    this.installed.add(soft.name);
    this.remoteAppService.installApps([soft]);
  }
  gotoPage(pageIndex: number) {
    this.router.navigate([], { queryParams: { page: pageIndex } });
  }
  async refresh() {
    console.log('refresh');
    this.refresh$.next(null);
  }
}
