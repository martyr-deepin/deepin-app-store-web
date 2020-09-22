import { Injectable, NgZone } from '@angular/core';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { SoftwareService, Software } from 'app/services/software.service';
import { StorageService, StorageKey } from 'app/services/storage.service';
import { BehaviorSubject } from 'rxjs';
import { StoreService, Package } from 'app/modules/client/services/store.service';
import { SysAuthService } from 'app/services/sys-auth.service';
import { JobService } from 'app/services/job.service';
import { LocalAppService } from 'app/modules/my-apps/services/local-app.service';

@Injectable({
  providedIn: 'root',
})
export class MyUpdatesService {
  constructor(
    private softwareService: SoftwareService,
    private storageService: StorageService,
    private storeService: StoreService,
    private sysAuthService: SysAuthService,
    private jobService: JobService,
    private zone: NgZone,
    private localService: LocalAppService,
  ) {
    this.zone.run(() => {
      this.init();
    });
    this.jobService.jobList().subscribe((res) => {
      this.updatings.forEach(async (soft, key) => {
        const pkg = await this.softwareService.query(soft).toPromise();
        if (pkg) {
          if (pkg.localVersion != soft.package.localVersion) {
            this.addRecentlyApps(soft);
            this.localService.dataUpdate$.next(1);
          }
        }
      });
    });
  }

  sysAuthStatus = false;

  //订阅可更新应用信息集合
  renewableApps$ = new BehaviorSubject<Software[]>([]);

  //最近更新应用缓存
  recentlyApps$ = new BehaviorSubject<object>({});

  softCache: Software[] = [];

  //可更新的数量
  renewableSize$ = this.renewableApps$.pipe(map((apps) => apps.length));

  renewableAppsLenght$ = new BehaviorSubject(0);
  //更新中的应用
  updatings: Map<string, Software> = new Map<string, Software>();

  init() {
    this.sysAuthService.sysAuthStatus$
      .pipe(
        distinctUntilChanged()
      )
      .pipe(
        map((status) => {
          this.sysAuthStatus = status;
          if (status) {
            this.query();
          } else {
            this.renewableApps$.next([]);
            this.renewableAppsLenght$.next(0);
            this.localService.dataUpdate$.next(1);
          }
        }),
      )
      .subscribe();
  }

  // sync renewableApps
  sync(pkg: Package, soft: Software) {
    if (pkg && pkg.upgradable) {
      let cache = this.softCache.find((s) => s.id === soft.id);
      if (!cache) {
        soft.package.size = pkg.size;
        this.softCache.push(soft);
        this.renewableApps$.next(this.softCache);
      }
    }
  }

  query(offset = 0, pageSize = 20) {
    this.storeService.InstalledPackages().subscribe(async (packages) => {
      if(!(packages instanceof Array)) {
        packages = []
      }
      const package_names = packages.filter((pkg) => pkg.upgradable).map((pack) => pack.packageName);
      const param = {
        offset: offset,
        limit: pageSize,
        package_name: package_names.length ? package_names : ['notfund-packages'],
      };
      let softs = await this.softwareService.list({}, param);
      if(this.sysAuthStatus) {
        this.renewableAppsLenght$.next(softs.length);
      }
      //排除忽略更新的应用
      // const ignoreApps = this.getIgnoreApps();
      // if (ignoreApps) {
      //   softs = softs.filter((soft) => !(ignoreApps[soft.id] && ignoreApps[soft.id] == soft.package.remoteVersion));
      // }
      //计算可更新应用的大小
      // const sizes = await this.storeService.queryDownloadSize(softs.map(this.toQuery)).toPromise();
      softs.map((soft) => {
        soft.package.size = packages.find((pack) => soft.package_name === pack.packageName)?.size;
        return soft;
      });
      this.renewableApps$.next(softs);
    });
  }

  //加入近期更新列表
  addRecentlyApps(software: Software) {
    let recentlyApps = this.getRecentlyApps();
    if (!recentlyApps) {
      recentlyApps = {};
    }
    software.updated_at = new Date().getTime() + '';
    recentlyApps[software.id] = software;
    this.setRecentlyApp(recentlyApps);
    //从可更新列表中移除
    this.softCache = this.softCache.filter((soft) => soft.id != software.id);
    this.renewableApps$.next(this.softCache);
    this.renewableAppsLenght$.next(this.softCache.length);
    this.updatings.delete(software.package_name);
  }

  //从缓存中查询被忽略的应用
  getIgnoreApps() {
    return this.storageService.getObject(StorageKey.ignoreAppMap);
  }

  //保存忽略应用
  setIgnoreApp(value: any) {
    this.storageService.setObject(StorageKey.ignoreAppMap, value);
  }

  //从缓存中查询近期更新包Id列表
  getRecentlyApps() {
    return this.storageService.getObject(StorageKey.recentlyAppMap) || {};
  }

  //记录近期更新
  setRecentlyApp(value: any) {
    this.storageService.setObject(StorageKey.recentlyAppMap, value);
    this.recentlyApps$.next(value);
  }
}
