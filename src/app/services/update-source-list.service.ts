import { Injectable } from '@angular/core';
import { StoreService } from 'app/modules/client/services/store.service';
import { StoreJobInfo,StoreJobStatus } from 'app/modules/client/models/store-job-info';
import { BehaviorSubject, Subscription } from 'rxjs';
import { switchMap, filter, take } from 'rxjs/operators';
import { Software, SoftwareService } from './software.service';

@Injectable({
  providedIn: 'root',
})
export class UpdateSourceListService {
  private updateSourceList$ = new BehaviorSubject<StoreJobInfo>(undefined);
  private buttonCache:Map<number,HTMLButtonElement> = new Map<number,HTMLButtonElement>();
  private jobId= '/com/deepin/lastore/Jobupdate_source';
  private interval = undefined;

  constructor(private store: StoreService,private softwareService:SoftwareService) {}

  updateSourceList() {
    return this.store.getJobStatus(this.jobId).pipe(
      switchMap(job=> {
        if(job.status == undefined || !this.interval) {
          this.store.storeUpdate().toPromise().then(res =>{
            new Promise<StoreJobInfo>((resolve) => {
              this.interval = setInterval(() => {
                this.store
                  .getJobStatus(this.jobId)
                  .toPromise()
                  .then((obj) => {
                    switch (obj.status) {
                      // case StoreJobStatus.running:
                      //   break;
                      case undefined:
                        resolve()
                        this.updateSourceList$.next(undefined)
                        clearInterval(this.interval);
                        this.interval = undefined;
                        break;
                      default:
                        this.updateSourceList$.next(obj)
                        break;
                    }
                  })
                  .catch(() => {
                    resolve();
                    clearInterval(this.interval);
                    this.interval = undefined;
                  });
              }, 1000);
            }).then(res=>{
              this.loadingAllOff();
            })
          })
        }
        return this.updateSourceList$
      })
    )
  }

  //toUpdate() {}

  controlInit(el: HTMLButtonElement,appId:number) {
    if(this.buttonCache.get(appId)) {
      this.loadingOn(el,appId)
    }
  }

  loadingOn(el: HTMLButtonElement,appId:number) {
    let img = document.createElement('img');
    img.style.content = "url('/assets/buttons/loading.svg')";
    img.style.width = '1.6rem';
    img.style.height = '1.6rem';
    img.style.verticalAlign = 'middle';
    el.style.pointerEvents = 'none';
    el.prepend(img);
    if(!this.buttonCache.get(appId)) {
      this.buttonCache.set(appId,el)
    }
  }

  loadingOff(el: HTMLButtonElement,appId:number) {
    el.style.pointerEvents = '';
    let imgs = el.firstElementChild;
    el.removeChild(imgs)
    this.buttonCache.delete(appId)
  }

  loadingAllOff() {
    this.buttonCache.forEach((value,key)=>{
      value.style.pointerEvents = '';
      let imgs = value.firstElementChild;
      value.removeChild(imgs)
    })
    this.buttonCache.clear()
  }

  async installApp(e:Event,soft:Software,updateSubscription:Subscription){
    let pkg = await this.softwareService.query(soft).toPromise();
    if(pkg&&pkg.remoteVersion) {
      this.softwareService.install(soft)
    }else {
      this.loadingOn(<HTMLButtonElement>e.target, soft.id);
      if(updateSubscription){
        updateSubscription.unsubscribe()
      }
      updateSubscription = this
        .updateSourceList()
        .pipe(
          filter(jobInfo=>jobInfo!=undefined),
          take(1)
        )
        .subscribe((jobInfo) => {
          this.loadingOff(<HTMLButtonElement>e.target, soft.id)
          if(jobInfo.status != StoreJobStatus.failed) {
            this.softwareService.install(soft)
          }
          updateSubscription.unsubscribe()
        });
    }
  }

}
