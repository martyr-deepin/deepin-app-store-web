import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { map, switchMap, first, tap, scan } from 'rxjs/operators';

import { LocalAppService } from '../../services/local-app.service';
import { AuthService } from 'app/services/auth.service';
import { Software } from 'app/services/software.service';
import { JobService } from 'app/services/job.service';
import { Subscription } from 'rxjs';
import { StoreService, LocalApp } from 'app/modules/client/services/store.service';
import { isEqual } from 'lodash';

@Component({
  selector: 'dstore-local-app',
  templateUrl: './local-app.component.html',
  styleUrls: ['./local-app.component.scss'],
})
export class LocalAppComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router, 
    private localAppService: LocalAppService, 
    private authService: AuthService,
    private jobService: JobService,
    private storeService: StoreService,
  ) {}

  readonly DisabledList = [
    'dde',
    'dde-control-center',
    'dde-introduction',
    'dde-file-manager',
    'deepin-app-store',
    'deepin-manual',
  ];
  readonly pageSize = 20;
  logged = this.authService.logged$;
  selected: string;
  removing: string[] = [];
  loading: boolean = false;
  jobListChange: Subscription;

  result$ = this.localAppService.offset$.pipe(
    tap((offset) => {
      if (offset > 0) {
        this.loading = true;
      }
    }),
    switchMap((offset) => {
      return this.localAppService.list({ offset: offset });
    }),
    scan((acc, value) => {
      return this.localAppService.jobFlush?value:[...acc, ...value];
    }),
    tap(() => {
      this.loading = false;
      this.localAppService.jobFlush = false;
    }),
  );

  removingList$ = this.localAppService.removingList().pipe(
    map((list) => {
      this.removing = list;
      return list;
    })
  );

  remove(soft: Software) {
    this.localAppService.onRemove = true;
    this.removing.push(soft.package_name || soft.package.appName);
    this.localAppService.removeLocal(soft);
    this.selected = null;
  }

  login = () => this.authService.login();

  ngOnInit() {
    this.localAppService.offset$.next(0);
    this.localAppService.query = { check: undefined, name: undefined };
    this.jobListChange = this.jobService.jobList().pipe(
      map(async () => {
        if(this.localAppService.cache) {
          let res = await this.storeService.InstalledPackages().toPromise();
          if( this.diffrent(res,this.localAppService.cache) ) {
            this.localAppService.jobFlush = true;
            this.localAppService.dataUpdate$.next(1);
          }
        }
      })
    ).subscribe()
  }
  
  diffrent(arr1: LocalApp[], arr2: LocalApp[]): boolean {
    if (arr1.length != arr2.length) {
      return true;
    }
    let arrmap1 = arr1.map((local) => {
      return { name: local.packageName, version: local.localVersion };
    });
    let arrmap2 = arr2.map((local) => {
      return { name: local.packageName, version: local.localVersion };
    });
    return !isEqual(arrmap1, arrmap2);
  }

  ngOnDestroy(): void {
    if(this.jobListChange) {
      this.jobListChange.unsubscribe();
    }
  }

  gotoPage(pageIndex: number) {
    this.router.navigate([], { queryParams: { page: pageIndex } });
  }

  intersecting(intersecting: boolean) {
    if (intersecting) {
      this.localAppService.offset$.pipe(first()).subscribe((offset) => {
        this.localAppService.offset$.next(offset + this.pageSize);
      });
    }
  }
}
