import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, BehaviorSubject } from 'rxjs';
import { map, switchMap, share, distinctUntilChanged } from 'rxjs/operators';
import { RemoteAppService } from './../../services/remote-app.service';
import { Software } from 'app/services/software.service';
@Component({
  selector: 'dstore-remote-app',
  templateUrl: './remote-app.component.html',
  styleUrls: ['./remote-app.component.scss'],
})
export class RemoteAppComponent implements OnInit {
  constructor(private route: ActivatedRoute, public router: Router, private remoteAppService: RemoteAppService) {}
  readonly pageSize = 13;
  pageIndex$ = this.route.queryParamMap.pipe(map(query => Number(query.get('page')) || 0));
  result$ = this.pageIndex$.pipe(
    switchMap(pageIndex => this.remoteAppService.list({ offset: pageIndex * this.pageSize, limit: this.pageSize })),
    share(),
  );
  installed = new Set<string>();
  apps$ = this.result$.pipe(map(result => result.items));
  count$ = this.result$.pipe(map(result => Math.ceil(result.count / this.pageSize)));
  installing$ = this.remoteAppService.installingList();
  ngOnInit() {
    this.remoteAppService.list();
  }

  installApp(soft: Software) {
    this.installed.add(soft.name);
    this.remoteAppService.installApps([soft]);
  }
  gotoPage(pageIndex: number) {
    this.router.navigate([], { queryParams: { page: pageIndex } });
  }
}
