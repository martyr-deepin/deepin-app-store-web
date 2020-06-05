import { Component, OnInit, OnDestroy } from "@angular/core";
import { MyUpdatesService } from './services/my-updates.service';
import { SoftwareService } from 'app/services/software.service';
import { first, switchMap } from 'rxjs/operators';
import { JobService } from 'app/services/job.service';
import { StoreJobType, StoreJobStatus } from '../client/models/store-job-info';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { SysAuthService } from 'app/services/sys-auth.service';

@Component({
  selector:"dstore-my-updates",
  templateUrl: './my-updates.component.html',
  styleUrls: ['./my-updates.component.scss'],
})
export class MyUpdatesComponent implements OnInit,OnDestroy{
  
  constructor(
    public service:MyUpdatesService,
    private softwareService:SoftwareService,
    private jobService:JobService,
    private router:Router,
    private route:ActivatedRoute,
    private sysAuth: SysAuthService
  ){}

  sysAuthStatus$ = this.sysAuth.sysAuthStatus$;

  ngOnInit(){
    this.path = this.route.firstChild.snapshot.routeConfig['path']
    //初始化消息
    this.selectChange(0)
  }

  dueTime:number=1000*60*60*24*30;
  selectChange(value:number) {
    let nowTime = new Date(new Date().toLocaleDateString()).getTime()+1000*60*60*24
    if(value){
      this.dueTime = value;
    }
    //获取已更新列表
    let apps = this.service.getRecentlyApps()
    if(apps) {
      const beforeTime = nowTime - this.dueTime
      for(var key in apps) {
        if((Number(apps[key].updated_at)-0) < beforeTime) {
          delete apps[key]
        }
      }
      this.service.recentlyApps$.next(apps)
    }

  }

  jobList = []

  //正在执行的任务状态
  jobsStatus$ = this.jobService.jobsInfo().pipe(
    switchMap(async infoList => {
      const CountType = [StoreJobType.install, StoreJobType.download];
      //获取更新列表
      const apps = await this.service.renewableApps$.pipe(first()).toPromise()
      const packageNames = apps.map(app=>app.package_name)
      const result = infoList.filter(info => CountType.includes(info.type))
        .filter(info => packageNames.includes(info.packages[0]) );
      //判断全部暂停/全部恢复
      let status = 0;
      if(result.length>0) {
        status = 1;
        if(result.filter(info => info.status === StoreJobStatus.paused).length === result.length) {
          status = 2;
        }
      }
      this.jobList = result;
      return status;
    })
  )

  //最近更新的任务数量
  recentlyLength$ = this.service.recentlyApps$.pipe(
    switchMap(async result => {
      const recents = Object.keys(result).map(val => ({id:parseInt(val),updateDate:result[val]}))
      return recents.length;
    })
  )

  updateAll(){
    //全部更新
    const res = this.service.softCache;
    if(res.length) {
      this.service.updatings = res.map(soft => soft.package_name)
      this.softwareService.install(...res)
    }
  }

  pauseAll(){
    //全部暂停
    this.jobList.forEach(e => {
      this.jobService.stopJob(e.job)
    })
  }

  startAll() {
    //全部启动
    this.jobList.forEach(e => {
      this.jobService.startJob(e.job)
    })
  }

  //当前路由path
  path:string;
  path$ = this.router.events.subscribe(event=>{
    if(event instanceof NavigationEnd) {
      this.path = this.route.firstChild.snapshot.routeConfig['path']
    }
  })


  ngOnDestroy(){
    if(this.path$) {
      this.path$.unsubscribe()
    }
  }

  sysAuthMessage() {
    this.sysAuth.authorizationNotify()
  }
}