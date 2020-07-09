import { Component, Input, ElementRef } from '@angular/core';
import { Software, SoftwareService } from 'app/services/software.service';
import { StoreJobInfo, StoreJobStatus, StoreJobError, StoreJobErrorType, CanFixError } from 'app/modules/client/models/store-job-info';
import { switchMap, filter } from 'rxjs/operators';
import { StoreService } from 'app/modules/client/services/store.service';
import { JobService } from 'app/services/job.service';
import { MyUpdatesService } from '../../services/my-updates.service';
import { Subscription } from 'rxjs';
import { SysAuthService } from 'app/services/sys-auth.service';

@Component({
  selector: 'my-updates-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent {

  constructor(
    private service:MyUpdatesService,
    private softwareService: SoftwareService,
    private jobService: JobService,
    private storeService: StoreService,
    private sysAuth: SysAuthService,
    private el: ElementRef
  ) {}

  @Input() software:Software;

  @Input() job:StoreJobInfo=null;
  
  StoreJobStatus = StoreJobStatus;

  subscribe:Subscription;
  inited:number = 0;

 

  update(): void {
    if(!this.service.updatings.get(this.software.package_name)){
      this.service.updatings.set(this.software.package_name,this.software)
    }
    this.softwareService.install(this.software)
  }

  //忽略当前版本
  ignoreVersion(){
    let apps = this.service.getIgnoreApps()
    if(!apps) {
      apps = {}
    }
    apps[this.software.id]=this.software.package.remoteVersion
    this.service.setIgnoreApp(apps)
  }

  //开始任务
  start = (id:string) => {
    this.jobService.startJob(id);
  }

  //暂停任务
  pause = (id:string) => this.jobService.stopJob(id);

  //取消任务
  cancelled:boolean = false;
  cancel = (job:string) => {
    this.service.updatings.delete(this.software.package_name)
    this.cancelled = true;
    this.jobService.clearJob(job)
  };

  //任务失败重试
  fixing = false;
  retry(job:StoreJobInfo) {
    let err: StoreJobError;
    try {
      err = JSON.parse(job.description) as StoreJobError;
    } catch (e) {
      err = { ErrType: StoreJobErrorType.unknown, ErrDetail: job.description };
    }
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

  //判断是否溢出
  judgeOverflow$ = new Promise((resove)=>{
    var timeout = setTimeout(()=>{
      clearTimeout(timeout)
      resove(this.judge_overflow())
    })
  })

  judge_overflow() {
    const nativeElement = this.el.nativeElement
    const log_content = nativeElement.querySelector('.log_content')
    return log_content.scrollHeight > log_content.clientHeight || false;
  }

  sysAuthStatus$ = this.sysAuth.sysAuthStatus$;
  sysAuthMessage() {
    this.sysAuth.authorizationNotify()
  }

}
