import { Component, OnInit } from '@angular/core';
import { MyUpdatesService } from '../../services/my-updates.service';
import { map, scan, tap, debounceTime } from 'rxjs/operators';
import { JobService } from 'app/services/job.service';
import { StoreJobInfo } from 'app/modules/client/models/store-job-info';

@Component({
  selector: 'm-renewable',
  templateUrl: './renewable.component.html',
  styleUrls: ['./renewable.component.scss'],
})
export class RenewableComponent implements OnInit {
  constructor(private service: MyUpdatesService, private jobService: JobService) {}

  offset = 0;
  loading = true;
  readonly pageSize = 20;

  ngOnInit(): void {
    this.service.query();
  }

  renewableApps$ = this.service.renewableApps$.pipe(
    tap(() => {
      if(this.offset>0) {
        this.loading = true;
      }
    }),
    debounceTime(100),
    scan((acc, value) => 
      this.offset > 0?[...acc, ...value]:value
    ),
    map((softs) => {
      this.service.softCache = softs;
      return softs;
    }),
    tap(() => {
      this.loading = false;
    }),
  );

  jobs$ = this.jobService.jobsInfo().pipe(
    map((job) => {
      let jobMap = new Map<string, StoreJobInfo>(job.map((job) => [job.names[0], job]));
      return jobMap;
    }),
  );

  intersecting(intersecting: boolean) {
    if (intersecting) {
      this.offset += this.pageSize;
      this.service.query(this.offset, this.pageSize);
    }
  }
}
