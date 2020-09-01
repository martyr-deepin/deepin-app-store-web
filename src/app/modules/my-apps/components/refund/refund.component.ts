import { Component, OnInit, ViewChild, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { RefundReason } from '../../services/refund-reason.model';
import { RemoteApp } from '../../services/remote-app.service';
import { RefundService, RefundCode } from 'app/services/refund.service';
import { PayStatus } from 'app/services/order.service';
import { StoreService } from 'app/modules/client/services/store.service';
@Component({
  selector: 'm-refund',
  templateUrl: './refund.component.html',
  styleUrls: ['./refund.component.scss'],
})
export class RefundComponent implements OnInit {
  constructor(private fb: FormBuilder, private refundService: RefundService, private storeService: StoreService) {}
  readonly RefundReason = RefundReason;
  readonly RefundCode = RefundCode;
  @ViewChild('dialogRef', { static: true }) dialog: ElementRef<HTMLDialogElement>;
  @Input() remoteApp: RemoteApp;
  @Output() confirm = new EventEmitter();
  @Output() cancel = new EventEmitter<boolean>();
  form = this.fb.group({
    reason: this.fb.array([...Object.values(RefundReason).map(() => [false])], requiredTrueArray()),
    content: ['', Validators.required],
  });
  successTip = false;
  refund_code = { code: 0 };
  ngOnInit() {
    this.dialog.nativeElement.showModal();
    this.dialog.nativeElement.addEventListener('close', () => this.cancel.next(), (this.successTip = false));
  }
  close() {
    this.dialog.nativeElement.close();
    this.successTip = false;
  }
  async submit() {
    const formValue = {
      reason: this.form.value.reason
        .map((bool: boolean, index: number) => (bool ? index + 1 : null))
        .filter(Boolean)
        .join(','),
      content: this.form.value.content,
    };

    this.refund_code = <{ code: number }>await this.refundService.create(this.remoteApp.order_number, formValue);
    this.appPayStatus(this.refund_code.code, this.remoteApp.app.package_name);
    this.confirm.emit(this.remoteApp.app_id);
    this.successTip = true;
  }

  appPayStatus(refund_code: RefundCode, package_name: string) {
    let payStatus: PayStatus;
    switch (refund_code) {
      case RefundCode.Success:
        payStatus = PayStatus.RefundSuccess;
        break;
      case RefundCode.Review:
        payStatus = PayStatus.Refunding;
        break;
      case RefundCode.Refunding:
        payStatus = PayStatus.Refunding;
        break;
      case RefundCode.TimeOut:
        payStatus = PayStatus.RefundFailed;
        break;
      case RefundCode.error:
        payStatus = PayStatus.RefundFailed;
        break;
    }
    if (payStatus) {
      this.storeService.appPayStatus({ appId: package_name, status: payStatus });
    }
  }
}

function requiredTrueArray() {
  return (control: FormArray) => {
    if (control.controls.some((c) => Validators.requiredTrue(c) == null)) {
      return null;
    }
    return { required: true };
  };
}
