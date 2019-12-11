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
  readonly pageSize = 20;
  readonly RefundStatus = RefundStatus;
  refresh$ = new BehaviorSubject(null);
  free = true;
  pageIndex$ = this.refresh$.pipe(
    switchMap(() => this.route.queryParamMap),
    map(query => Number(query.get('page')) || 0),
  );
  result$ = this.pageIndex$.pipe(
    switchMap(pageIndex => {
      console.log(this.free);
      let params = { offset: pageIndex * this.pageSize, limit: this.pageSize };

      if (this.free === false) {
        params['free'] = false;
      }
      return this.remoteAppService.list(params);
    }),
    share(),
  );
  installed = new Set<string>();
  apps$ = this.result$.pipe(map(result => result.items));
  count$ = this.result$.pipe(map(result => Math.ceil(result.count / this.pageSize)));
  installing$ = this.remoteAppService.installingList().pipe(
    map(v => {
      console.log(v);
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
  async refresh() {
    this.refresh$.next(null);
  }
  freeChange(free: boolean) {
    this.free = free;
    this.router.navigate([], { queryParams: { page: 0 } });
  }
}
