import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { switchMap, filter } from 'rxjs/operators';

import { StoreService } from 'app/modules/client/services/store.service';
import {
  StoreJobInfo,
  StoreJobType,
  StoreJobStatus,
  CanFixError,
  StoreJobError,
  StoreJobErrorType,
} from 'app/modules/client/models/store-job-info';
import { JobService } from 'app/services/job.service';
import { SoftwareService, Software } from 'app/services/software.service';
import { UpdateSourceListService } from 'app/services/update-source-list.service';

@Component({
  selector: 'dstore-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('in', style({ height: '*' })),
      transition(':enter', [style({ height: 0 }), animate(100)]),
      transition(':leave', [animate(100, style({ height: 0 }))]),
    ]),
  ],
})
export class DownloadComponent implements OnInit {
  constructor(
    private storeService: StoreService,
    private jobService: JobService,
    private softwareService: SoftwareService,
    private updaetSourceListService:UpdateSourceListService
  ) {}

  StoreJobType = StoreJobType;
  StoreJobStatus = StoreJobStatus;

  fixing = false;
  cancelled = new Set<string>();
  private soft_cache = new Map<string, Software>();
  result$ = this.jobService.jobsInfo().pipe(
    switchMap(async jobs => {
      const names = jobs
        .filter(job => [StoreJobType.install, StoreJobType.download].includes(job.type))
        .reduce((acc, job) => [...acc, ...job.packages], [] as string[])
        .filter(name => !this.soft_cache.has(name));
      if (names.length > 0) {
        const softs = await this.softwareService.list({}, { package_name: names });
        softs.forEach(soft => this.soft_cache.set(soft.package_name, soft));
        if(!softs.length) {
          names.forEach(name=>{
            this.jobService.clearJob(jobs.find(job=>job.packages.includes(name))?.job)
          })
        }
      }
      return jobs.reduce(
        (acc, job) => [
          ...acc,
          ...job.names.map(name => ({ job, soft: this.soft_cache.get(name) })).filter(v => v.soft),
        ],
        [] as { job: StoreJobInfo; soft: Software }[],
      );
    }),
  );
  floor = Math.floor;
  // 下载任务控制
  start = (id: string) => this.jobService.startJob(id);
  pause = (id: string) => this.jobService.stopJob(id);

  ngOnInit() {}

  cancel(job: string) {
    this.cancelled.add(job);
    this.jobService.clearJob(job);
  }
  // what ?
  retry(job: StoreJobInfo) {
    let err: StoreJobError;
    try {
      err = JSON.parse(job.description) as StoreJobError;
    } catch (e) {
      err = { ErrType: StoreJobErrorType.unknown, ErrDetail: job.description };
    }

    this.updaetSourceListService.updateSourceList().toPromise()
    this.jobService.startJob(job.job);

    if (CanFixError.includes(err.ErrType)) {
      this.fixing = true;
      this.storeService
        .fixError(err.ErrType.toString().split('::')[1])
        .pipe(
          switchMap(
            () => this.storeService.jobListChange(),
            (jobPath, jobList) => jobList.includes(jobPath),
          ),
          filter(exists => !exists),
        )
        .subscribe(() => {
          this.fixing = false;
          this.storeService.resumeJob(job.job);
        });
    }
  }
  trackByFn(index, item) {
    return item.job.job;
  }
}