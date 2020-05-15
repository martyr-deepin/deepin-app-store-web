import { Component, OnInit, Input, ElementRef} from '@angular/core';
import { StoreJobErrorType, StoreJobError } from 'app/modules/client/models/store-job-info';
import PerfectScrollbar from "perfect-scrollbar";

@Component({
  selector: 'app-store-job-error',
  templateUrl: './store-job-error.component.html',
  styleUrls: ['./store-job-error.component.scss'],
})
export class StoreJobErrorComponent implements OnInit {
  constructor(
    private el: ElementRef<HTMLDivElement>
  ) {}

  StoreJobErrorType = StoreJobErrorType;

  @Input()
  set rowString(s: string) {
    try {
      const err = JSON.parse(s) as StoreJobError;
      this.errType = err.ErrType;
      this.errDetail = err.ErrDetail;
    } catch {
      this.errType = StoreJobErrorType.unknown;
      this.errDetail = s;
    }
  }

  errType: StoreJobErrorType;
  errDetail: string;
  ngOnInit() {
    new PerfectScrollbar(this.el.nativeElement.querySelector(".details_content"),{
      wheelPropagation: true
    })

  }
  click(event: Event) {
    event.stopPropagation();
  }
}
