import { Component, OnInit, Input, Output, HostListener, SimpleChanges, OnChanges } from '@angular/core';
import { Software, SoftwareService } from 'app/services/software.service';
import { PackageService } from 'app/services/package.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { share, first, startWith, map, pairwise, switchMap } from 'rxjs/operators';
import { JobService } from 'app/services/job.service';
import { trigger, animate, style, transition, keyframes } from '@angular/animations';
import { StoreJobInfo, StoreJobStatus } from 'app/modules/client/models/store-job-info';
import { BuyService } from 'app/services/buy.service';
import { UserAppsService } from 'app/services/user-apps.service';
import { SysAuthService } from 'app/services/sys-auth.service';
import { BlacklistService } from 'app/services/blacklist.service';

@Component({
  selector: 'dstore-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
  animations: [
    trigger('circle', [
      transition(
        ':enter',
        animate(
          200,
          keyframes([
            style({ opacity: 0, transform: 'translateX(100%)' }),
            style({ opacity: 1, transform: 'translateX(0)' }),
          ]),
        ),
      ),
      transition(
        ':leave',
        animate(
          200,
          keyframes([
            style({
              position: 'absolute',
              opacity: 1,
              transform: 'translateX(0)',
            }),
            style({
              position: 'absolute',
              opacity: 0,
              transform: 'translateX(100%)',
            }),
          ]),
        ),
      ),
    ]),
  ],
})
export class ControlComponent implements OnInit, OnChanges {
  constructor(
    private softwareService: SoftwareService,
    private packageService: PackageService,
    private jobService: JobService,
    private buyService: BuyService,
    private userAppService: UserAppsService,
    private sysAuth: SysAuthService,
  ) {}
  @Input() soft: Software;
  @Output() job$: Observable<any>;
  package$ = new BehaviorSubject(null);
  userAppIDs$ = this.userAppService.userAllApp$;
  JobStatus = StoreJobStatus;
  show = false;
  id = Math.random();
  sysAuthStatus$ = this.sysAuth.sysAuthStatus$;

  ngOnInit() {}
  ngOnChanges(c: SimpleChanges) {
    if (c.soft) {
      this.init();
    }
  }
  @HostListener('click', ['$event']) click(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }
  init() {
    this.queryPackage();
    this.job$ = this.jobService.jobsInfo().pipe(
      map(jobs => jobs.find(job => job.names.includes(this.soft.package_name))),
      startWith(null),
      pairwise(),
      switchMap(async ([old, job]) => {
        setTimeout(() => (this.show = Boolean(job)));
        if (old && !job) {
          await this.queryPackage();
        }
        return job;
      }),
      share(),
    );
  }
  async queryPackage() {
    const pkg = await this.softwareService.query(this.soft).toPromise();
    this.package$.next(pkg);
  }

  openApp(e: Event) {
    this.softwareService.open(this.soft);
  }

  installApp(e: Event) {
    this.softwareService.install(this.soft);
  }

  buyApp(e: Event) {
    this.buyService.buyDialogShow$.next(this.soft);
  }
  sysAuthMessage() {
    console.log('trigger sys Authorizaed message ');
    this.sysAuth.authorizationNotify();
  }
  trigger(e: Event, job: StoreJobInfo) {
    e.stopPropagation();
    if (job.status === this.JobStatus.paused || job.status === this.JobStatus.failed) {
      job.status = this.JobStatus.running;
      this.jobService.startJob(job.job);
    } else {
      job.status = this.JobStatus.paused;
      this.jobService.stopJob(job.job);
    }
  }
}
