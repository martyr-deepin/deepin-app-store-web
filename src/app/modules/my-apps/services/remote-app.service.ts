import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { switchMap, map, distinctUntilChanged } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { JobService } from 'app/services/job.service';
import { StoreJobType } from 'app/modules/client/models/store-job-info';
import { Software, SoftwareService } from 'app/services/software.service';
import { APIBase, ListOption } from 'app/services/api';
import { OrderService } from 'app/services/order.service';
import { RefundService } from 'app/services/refund.service';

@Injectable({
  providedIn: 'root',
})
export class RemoteAppService extends APIBase<RemoteApp> {
  url = environment.operationServer + '/api/user/my/app';
  constructor(
    private http: HttpClient,
    private softService: SoftwareService,
    private jobService: JobService,
    private orderService: OrderService,
    private refundService: RefundService,
  ) {
    super(http, '/api/user/app');
  }
  private readonly RefundMaxTime = 2 * 60 * 60;
  async list(opt?: ListOption) {
    const resp = await super.list(opt);
    console.log('remote list', resp);
    const softs = await this.softService.list({ ids: resp.items.map(item => item.app_id) });
    resp.items.forEach(item => {
      item.soft = softs.find(soft => soft.id === item.app_id);
    });
    resp.items = resp.items.filter(item => item.soft);
    const now = new Date().getTime();
    for (const item of resp.items) {
      if (item.order_number) {
        const order = await this.orderService.get(item.order_number as any);
        item.can_refund = (now - new Date(order.updated_at).getTime()) / 1000 < this.RefundMaxTime;
        if (item.can_refund) {
          try {
            const refunds = await this.refundService.list(item.order_number);
            refunds.forEach(refund => (refund.created_at = new Date(refund.created_at)));
            if (refunds.length > 0) {
              refunds.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
            }
            item.refund_status = refunds[0].status;
            console.log({ item }, refunds[0].status);
          } catch (err) {}
        }
      }
    }
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
  created_at: string;
  updated_at: string;
  deleted_at?: any;
  uid: number;
  app_id: number;
  app_version: string;
  order_number?: string;

  soft?: Software;
  can_refund: boolean;
  refund_status: string;
}
