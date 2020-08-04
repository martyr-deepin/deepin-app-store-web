import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { map, switchMap, share, startWith } from 'rxjs/operators';

import { LocalAppService } from '../../services/local-app.service';
import { AuthService } from 'app/services/auth.service';
import { Software } from 'app/services/software.service';

@Component({
  selector: 'dstore-local-app',
  templateUrl: './local-app.component.html',
  styleUrls: ['./local-app.component.scss'],
})
export class LocalAppComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localAppService: LocalAppService,
    private authService: AuthService,
  ) {}
  readonly DisabledList = [
    'dde',
    'dde-control-center',
    'dde-introduction',
    'dde-file-manager',
    'deepin-app-store',
    'deepin-manual',
  ];
  readonly pageSize = 13;
  logged = this.authService.logged$;
  selected: string;
  removing: string[] = [];
  pageIndex$ = this.route.queryParamMap.pipe(map(query => Number(query.get('page') || 0)));
  result$ = this.pageIndex$.pipe(
    switchMap(pageIndex => {
      return this.localAppService.list({ pageSize: this.pageSize, pageIndex });
    })
  );
  count$ = this.result$.pipe(map(res=> Math.ceil(res.total/this.pageSize)));
  removingList$ = this.localAppService.removingList().pipe(
    map(list=>list)
  );

  remove(soft: Software) {
    this.localAppService.onRemove = true;
    this.removing.push(soft.package_name || soft.package.appName);
    this.localAppService.removeLocal(soft);
    this.selected = null;
  }

  login = ()=> this.authService.login();

  ngOnInit() {
    this.localAppService.query = {check:undefined,name:undefined}
  }

  gotoPage(pageIndex: number) {
    this.router.navigate([], { queryParams: { page: pageIndex } });
  }
}
