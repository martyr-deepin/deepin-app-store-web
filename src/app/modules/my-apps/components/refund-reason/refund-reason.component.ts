import { Component, OnInit, Input } from '@angular/core';
import { RefundReason } from '../../services/refund-reason.model';

@Component({
  selector: 'm-refund-reason',
  templateUrl: './refund-reason.component.html',
  styleUrls: ['./refund-reason.component.scss'],
})
export class RefundReasonComponent implements OnInit {
  constructor() {}
  RefundReason = RefundReason;
  @Input() reason: number;
  ngOnInit() {}
}
