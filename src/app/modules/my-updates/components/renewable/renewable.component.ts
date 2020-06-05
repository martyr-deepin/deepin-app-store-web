import { Component, OnInit } from '@angular/core';
import { MyUpdatesService } from '../../services/my-updates.service'
import { map } from 'rxjs/operators';
import { JobService } from 'app/services/job.service';
import { StoreJobInfo } from 'app/modules/client/models/store-job-info';

@Component({
  selector: 'm-renewable',
  templateUrl: './renewable.component.html',
  styleUrls: ['./renewable.component.scss']
})
export class RenewableComponent implements OnInit {

  constructor(
    private service: MyUpdatesService,
    private jobService:JobService
  ) {}

  ngOnInit(): void {
  }

  renewableApps$ = this.service.renewableApps$
  

  jobs$ = this.jobService.jobsInfo().pipe(
    map(job => {
      let jobMap = new Map<string,StoreJobInfo>(job.map(job => [job.names[0], job]));
      return jobMap;
    })
  );

}
