import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { JobService } from 'app/services/job.service';
import { StoreJobType } from 'app/modules/client/models/store-job-info';
import { Software, SoftwareService } from 'app/services/software.service';
import { APIBase, ListOption } from 'app/services/api';

@Injectable({
  providedIn: 'root',
})
export class RemoteAppService extends APIBase<RemoteApp> {
  constructor(private http: HttpClient, private softService: SoftwareService, private jobService: JobService) {
    super(http, '/api/user/app');
  }
  // get remote apps
  async list(opt?: ListOption) {
    const resp = await super.list(opt);
    if (resp.items.length === 0) {
      return resp;
    }
    // { noFilter: true }
    const softs = await this.softService.list({}, { id: resp.items.map(item => item.app_id) },{noFilter:true});
    resp.items.forEach(item => {
      item.soft = softs.find(soft => soft.id === item.app_id);
    });
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

export interface RemoteApp {
  id: number;
  created_at: Date;
  updated_at: Date;
  uid: number;
  app_id: number;
  app_version: string;
  order_number: string;
  can_refund: boolean;
  refund_reason: string;
  refund_status: string;
  unavailable: boolean;
  app: Software;
  soft?: Software;
}
