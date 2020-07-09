import { Component, Input, Output, HostListener, SimpleChanges, OnChanges, ElementRef } from '@angular/core';
import { Software, SoftwareService } from 'app/services/software.service';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { share, map, pairwise } from 'rxjs/operators';
import { JobService } from 'app/services/job.service';
import { trigger, animate, style, transition, keyframes } from '@angular/animations';
import { StoreJobInfo, StoreJobStatus } from 'app/modules/client/models/store-job-info';
import { BuyService } from 'app/services/buy.service';
import { UserAppsService } from 'app/services/user-apps.service';
import { SysAuthService } from 'app/services/sys-auth.service';
import { MyUpdatesService } from 'app/modules/my-updates/services/my-updates.service';
import { UpdateSourceListService } from 'app/services/update-source-list.service';
import { Package } from 'app/modules/client/services/store.service';

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
export class ControlComponent implements OnChanges {
  constructor(
    private elRef: ElementRef<HTMLElement>,
    private softwareService: SoftwareService,
    private jobService: JobService,
    private buyService: BuyService,
    private userAppService: UserAppsService,
    private sysAuth: SysAuthService,
    private myUpdateService: MyUpdatesService,
    private updateSourceList: UpdateSourceListService,
  ) {}
  @Input() soft: Software;
  @Output() job$: Observable<StoreJobInfo>;
  package$ = new BehaviorSubject<Package>(undefined);
  userAppIDs$ = this.userAppService.userAllApp$;
  JobStatus = StoreJobStatus;
  show = false;
  last = false;
  id = Math.random();
  sysAuthStatus$ = this.sysAuth.sysAuthStatus$;

  ngOnChanges(c: SimpleChanges) {
    if (c.soft) {
      this.init();
      let t = setTimeout(() => {
        this.updateSourceList.controlInit(<HTMLButtonElement>this.elRef.nativeElement.firstElementChild, this.soft.id);
        clearTimeout(t);
      }, 100);
    }
  }
  @HostListener('click', ['$event']) click(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }
  init() {
    this.queryPackageInit();
    this.job$ = this.jobService.jobsInfo().pipe(
      map((jobs) => jobs.find((job) => job.names.includes(this.soft.package_name))),
      pairwise(),
      map(([old, job]) => {
        setTimeout(() => (this.show = Boolean(job)));
        if (old && !job) {
          this.last = true;
          this.queryPackage();
        }
        if (!old && !job) {
          if (this.last) {
            this.queryPackage();
            this.last = false;
          }
        }
        return job;
      }),
      share(),
    );
  }
  queryPackage() {
    this.softwareService
      .query(this.soft)
      .toPromise()
      .then((pkg) => {
        this.package$.next(pkg);
      });
  }
  queryPackageInit() {
    this.softwareService
      .query(this.soft)
      .toPromise()
      .then((pkg) => {
        // update renewableApps
        this.myUpdateService.sync(pkg, this.soft);
        this.package$.next(pkg);
      });
  }

  openApp(e: Event) {
    this.softwareService.open(this.soft);
  }

  updateSubscription: Subscription;
  installApp(e: Event) {
    this.updateSourceList.installApp(e, this.soft, this.updateSubscription);
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
