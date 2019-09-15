import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { switchMap, map, distinctUntilChanged } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { JobService } from 'app/services/job.service';
import { StoreJobType } from 'app/modules/client/models/store-job-info';
import { Software, SoftwareService } from 'app/services/software.service';
import { APIBase, ListOption } from 'app/services/api';

@Injectable({
  providedIn: 'root',
})
export class RemoteAppService extends APIBase<RemoteApp> {
  url = environment.operationServer + '/api/user/my/app';
  constructor(private http: HttpClient, private softService: SoftwareService, private jobService: JobService) {
    super(http, '/api/user/app');
  }
  async list(opt?: ListOption) {
    const resp = await super.list(opt);
    const softs = await this.softService.list({ ids: resp.items.map(item => item.app_id) });
    resp.items.forEach(item => (item.soft = softs.find(soft => soft.id === item.app_id)));
    resp.items = resp.items.filter(item => item.soft);
    return resp;
  }

  installApps(softs: Software[]) {
    this.softService.install(...softs);
  }

  installingList() {
    const installType = [StoreJobType.install, StoreJobType.download];
    return this.jobService
      .jobsInfo()
      .pipe(
        map(jobs =>
          ([] as string[]).concat(...jobs.filter(job => installType.includes(job.type)).map(job => job.names)),
        ),
      );
  }
}

interface RemoteApp {
  app_id: number;
  app_version: string;
  created_at: string;

  soft?: Software;
}
