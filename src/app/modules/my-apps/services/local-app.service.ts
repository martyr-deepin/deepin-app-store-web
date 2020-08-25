import { Injectable } from '@angular/core';
import { switchMap, map, publishReplay } from 'rxjs/operators';
import { refCountDelay } from 'rxjs-etc/operators';

import { chunk, cloneDeep } from 'lodash';

import { JobService } from 'app/services/job.service';
import { StoreService } from 'app/modules/client/services/store.service';
import { StoreJobType } from 'app/modules/client/models/store-job-info';
import { environment } from 'environments/environment';
import { SoftwareService, Software } from 'app/services/software.service';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root',
})
export class LocalAppService {
  constructor(
    private jobService: JobService,
    private storeService: StoreService,
    private softwareService: SoftwareService,
  ) {}
  
  cache: any[];
  onRemove: boolean = false;
  offset$ = new BehaviorSubject(0);
  jobFlush = false;

  dataUpdate$ = new BehaviorSubject(0);
  
  instelld$ = this.dataUpdate$.pipe( switchMap( () => 
    this.storeService.InstalledPackages()
  ))

  list({ offset = 0, pageSize = 20 }) {
    return this.installedSofts$.pipe(
      map((list) => {
        //条件筛选
        let listTotal = this.search(list);
        if(offset > listTotal.length) {
          offset = listTotal.length;
        }
        if (this.jobFlush) {
          list = chunk(listTotal, offset||20)[0] || [];
        } else {
          list = chunk(listTotal.splice(offset), pageSize)[0] || [];
        }
        return list;
      }),
    );
  }

  installedSofts$ = this.instelld$.pipe(
    switchMap(async (installed) => {
      this.cache = cloneDeep(installed);
      installed = installed.sort((a, b) => b.installedTime - a.installedTime);
      if (!installed.length) {
        return [];
      }
      let list = installed.map((pkg) => {
        const localeName = pkg.allLocalName[environment.locale] || pkg.allLocalName['en_US'] || pkg.packageName;
        return {
          name: pkg.appName,
          package: pkg,
          localName: localeName,
          info: { name: localeName, packages: [{ packageURI: pkg.packageURI }] },
          software: null as Software,
        };
      });
      try {
        let softs = [];
        const pagePakcages = chunk(list, 20);
        for (var i = 0; i < pagePakcages.length; i++) {
          let result_softs = await this.softwareService.list(
            {},
            {
              package_name: pagePakcages[i]
                .map((localeApp) => localeApp.package.packageName)
                .sort((a, b) => a.localeCompare(b)),
            },
          );
          softs.push(...result_softs);
        }
        const m = new Map(softs.map((soft) => [soft.package_name, soft]));
        list.forEach((item) => {
          item.software = m.get(item.package.packageName);
          if (!item.software) {
            item.software = {} as any;
            item.software.name = item.package.appName;
            item.software.id = 0;
            item.software.info = item.info as any;
            item.software.package = item.package;
          }
        });
      } catch {}
      return list;
    }),
    publishReplay(1),
    refCountDelay(1000),
  );

  removingList() {
    return this.jobService.jobsInfo().pipe(
      map((jobs) => {
        return jobs
          .filter((job) => job.type === StoreJobType.uninstall)
          .map((job) => job.names)
          .reduce((acc, names) => {
            acc.push(...names);
            return acc;
          }, []);
      }),
    );
  }

  removeLocal(soft: Software) {
    this.softwareService.remove(soft);
  }

  query: Query = { check: undefined, name: undefined };
  //筛选
  search(apps: any[]) {
    let clone = cloneDeep(apps);
    let result: any[] = [];
    const check = this.query.check;
    let count = 0;
    if (check && check.length > 0) {
      count++;
      for (var i = 0; i < check.length; i++) {
        switch (check[i]) {
          case ScreenBoxKeys.all:
            apps = clone;
            break;
          case ScreenBoxKeys.lowScore:
            apps = clone.filter(
              (app) =>
                app.software.stat &&
                app.software.stat.score &&
                app.software.stat.score_count > 20 &&
                app.software.stat.score < 5,
            );
            break;
          case ScreenBoxKeys.freeApp:
            apps = clone.filter((app) => app.software.free || app.software.free === undefined);
            break;
          case ScreenBoxKeys.paidApp:
            apps = clone.filter((app) => app.software.free === false);
            break;
          default:
            apps = clone.filter((app) => app.software.info.category === String(check[i]).toLowerCase());
            break;
        }
        this.difference(result, apps);
      }
    }
    if (this.query.name && this.query.name.replace(/\s*/g, '') != '') {
      if (count) {
        result = result.filter(
          (app) =>
            app.software.info.name.indexOf(this.query.name) > -1 || app.software.name.indexOf(this.query.name) > -1,
        );
      } else {
        result = clone.filter(
          (app) =>
            app.software.info.name.indexOf(this.query.name) > -1 || app.software.name.indexOf(this.query.name) > -1,
        );
        count++;
      }
    }
    if (!count) {
      result = clone;
    }
    return result;
  }

  difference(arr1: any[], arr2: any[]) {
    arr2.forEach((a) => {
      if (arr1.findIndex((a2) => a2.software.name === a.software.name) === -1) {
        arr1.push(a);
      }
    });
  }
}

interface Query {
  name: string;
  check: any[];
}

export enum ScreenBoxKeys {
  all = 1,
  lowScore = 2,
  freeApp = 3,
  paidApp = 4,
}
