import { Component, OnInit, OnDestroy } from '@angular/core';
import { MyUpdatesService } from './services/my-updates.service';
import { SoftwareService } from 'app/services/software.service';
import { first, switchMap } from 'rxjs/operators';
import { JobService } from 'app/services/job.service';
import { StoreJobType, StoreJobStatus } from '../client/models/store-job-info';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { SysAuthService } from 'app/services/sys-auth.service';
import { environment } from 'environments/environment';
import { StoreMode } from 'app/services/storeMode';

@Component({
  selector: 'dstore-my-updates',
  templateUrl: './my-updates.component.html',
  styleUrls: ['./my-updates.component.scss'],
})
export class MyUpdatesComponent implements OnInit, OnDestroy {
  constructor(
    public service: MyUpdatesService,
    private softwareService: SoftwareService,
    private jobService: JobService,
    private router: Router,
    private route: ActivatedRoute,
    private sysAuth: SysAuthService,
  ) {}

  sysAuthStatus$ = this.sysAuth.sysAuthStatus$;
  //private store auth
  privateStoreAuth = true;
  ngOnInit() {
    if (environment.appStoreType === StoreMode.IntranetAppStore) {
      this.sysAuth.noIntranetAuth$.subscribe((v) => {
        this.privateStoreAuth = v;
      });
    }
    this.path = this.route.firstChild.snapshot.routeConfig['path'];
    // init subscribe
    this.selectChange(0);
  }

  dueTime: number = 1000 * 60 * 60 * 24 * 30;
  selectChange(value: number) {
    let nowTime = new Date().setHours(0, 0, 0, 0) + 1000 * 60 * 60 * 24;
    if (value) {
      this.dueTime = value;
    }
    // Query updated list
    let apps = this.service.getRecentlyApps();
    if (apps) {
      const beforeTime = nowTime - this.dueTime;
      for (var key in apps) {
        if (Number(apps[key].updated_at) - 0 < beforeTime) {
          delete apps[key];
        }
      }
      this.service.recentlyApps$.next(apps);
    }
  }

  jobList = [];

  // Runing jobs status
  jobsStatus$ = this.jobService.jobsInfo().pipe(
    switchMap(async (infoList) => {
      const CountType = [StoreJobType.install, StoreJobType.download];
      // Query renewableApps
      const apps = await this.service.renewableApps$.pipe(first()).toPromise();
      const packageNames = apps.map((app) => app.package_name);
      const result = infoList
        .filter((info) => CountType.includes(info.type))
        .filter((info) => packageNames.includes(info.packages[0]));
      let status = 0;
      if (result.length > 0) {
        status = 1;
        if (result.filter((info) => info.status === StoreJobStatus.paused).length === result.length) {
          status = 2;
        }
      }
      this.jobList = result;
      return status;
    }),
  );

  // Recent updated count
  recentlyLength$ = this.service.recentlyApps$.pipe(
    switchMap(async (result) => {
      const recents = Object.keys(result).map((val) => ({ id: parseInt(val), updateDate: result[val] }));
      return recents.length;
    }),
  );

  /**
   * Update all
   */
  updateAll(event:MouseEvent) {
    /**
     * private store auth logic
     */
    if (environment.appStoreType === StoreMode.IntranetAppStore && !this.privateStoreAuth) {
      this.sysAuth.setAuthMessage();
      let si = setTimeout(()=>{
        (<HTMLButtonElement>event.target).disabled = false;
        clearTimeout(si)
      },100)
      return;
    }
    const res = this.service.softCache;
    if (res.length) {
      res.map((soft) => {
        this.service.updatings.set(soft.package_name, soft);
      });
      this.softwareService.install(...res);
    }
  }

  /**
   * Pause All
   */
  pauseAll() {
    this.jobList.forEach((e) => {
      this.jobService.stopJob(e.job);
    });
  }

  /**
   * Start all
   */
  startAll() {
    this.jobList.forEach((e) => {
      this.jobService.startJob(e.job);
    });
  }

  // Switch router path
  path: string;
  path$ = this.router.events.subscribe((event) => {
    if (event instanceof NavigationEnd) {
      this.path = this.route.firstChild.snapshot.routeConfig['path'];
    }
  });

  ngOnDestroy() {
    if (this.path$) {
      this.path$.unsubscribe();
    }
  }

  sysAuthMessage() {
    this.sysAuth.authorizationNotify();
  }
}
