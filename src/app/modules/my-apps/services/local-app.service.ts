import { Injectable } from '@angular/core';
import { switchMap, map, publishReplay } from 'rxjs/operators';
import { refCountDelay } from 'rxjs-etc/operators';

import { chunk } from 'lodash';

import { JobService } from 'app/services/job.service';
import { StoreService, Package } from 'app/modules/client/services/store.service';
import { StoreJobType } from 'app/modules/client/models/store-job-info';
import { environment } from 'environments/environment';
import { SoftwareService, Software } from 'app/services/software.service';

@Injectable({
  providedIn: 'root',
})
export class LocalAppService {
  metadataServer = environment.metadataServer;
  constructor(
    private jobService: JobService,
    private storeService: StoreService,
    private softwareService: SoftwareService,
  ) {}
  installed$ = this.jobService.jobList().pipe(
    switchMap(() => {
      return this.storeService.InstalledPackages();
    }),
    publishReplay(1),
    refCountDelay(1000),
  );
  list({ pageIndex = 0, pageSize = 20 }) {
    return this.installed$.pipe(
      switchMap(async installed => {
        installed = installed.sort((a, b) => b.installedTime - a.installedTime);
        if (!installed.length) {
          return { total: 0, page: pageIndex, list: [] };
        }
        const list = chunk(installed, pageSize)[pageIndex].map(pkg => {
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
          const softs = await this.softwareService.list(
            {},
            { package_name: list.map(localeApp => localeApp.package.packageName) },
          );
          const m = new Map(softs.map(soft => [soft.package_name, soft]));
          list.forEach(item => {
            item.software = m.get(item.package.packageName);

            if (!item.software) {
              item.software = {} as any;
              item.software.id = 0;
              item.software.info = item.info as any;
              item.software.package = item.package;
            }
          });
        } catch {}
        return { total: installed.length, page: pageIndex, list };
      }),
    );
  }

  removingList() {
    return this.jobService.jobsInfo().pipe(
      map(jobs => {
        return jobs
          .filter(job => job.type === StoreJobType.uninstall)
          .map(job => job.names)
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
}
