import { Component, OnInit, Input } from '@angular/core';
import { StoreJobInfo, StoreJobType, StoreJobStatus } from 'app/modules/client/models/store-job-info';

@Component({
  selector: 'my-update-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {

  constructor(){}

  @Input() job: StoreJobInfo;
  @Input() cancelled:Boolean;

  storeJobType = StoreJobType;
  storeJobStatus = StoreJobStatus;

  ngOnInit(){}

}
