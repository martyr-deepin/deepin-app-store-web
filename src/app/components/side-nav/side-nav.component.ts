import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { trigger, style, transition, animate } from '@angular/animations';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { StoreJobType } from 'app/modules/client/models/store-job-info';
import { JobService } from 'app/services/job.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  animations: [
    trigger('dlcIn', [
      transition(':enter', [style({ width: 0 }), animate(100)]),
      transition(':leave', [animate(100, style({ width: 0 }))]),
    ]),
  ],
})
export class SideNavComponent implements OnInit {
  constructor(private sanitizer: DomSanitizer, private jobService: JobService) {}
  native = environment.native;
  // download count
  dc$: Observable<number>;

  ngOnInit() {
    const CountType = [StoreJobType.install, StoreJobType.download];
    this.dc$ = this.jobService.jobsInfo().pipe(
      map(infoList => {
        return infoList.filter(info => CountType.includes(info.type)).length;
      }),
    );
  }

  getStyle(icons: string[]) {
    return this.sanitizer.bypassSecurityTrustStyle(icons.map(url => `url(${url})`).join(','));
  }
}
