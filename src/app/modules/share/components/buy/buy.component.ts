import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { timer, Observable } from 'rxjs';
import { switchMap, share } from 'rxjs/operators';
import { Software } from 'app/services/software.service';
import { Payment } from 'app/services/payment';
import { OrderService, OrderStatus, OrderJSON } from '../../../../services/order.service';
import { DstoreObject } from 'app/modules/client/utils/dstore-objects';
import { BuyService } from 'app/services/buy.service';

@Component({
  selector: 'm-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.scss'],
})
export class BuyComponent implements OnInit {
  constructor(private fb: FormBuilder, private orderService: OrderService, private buyService: BuyService) {}
  readonly Payment = Payment;
  readonly OrderStatus = OrderStatus;
  @ViewChild('dialogRef', { static: true }) dialogRef: ElementRef<HTMLDialogElement>;
  @Input() soft: Software;
  @Output() cancel = new EventEmitter<void>();
  payment$: Observable<OrderJSON> = null;
  form = this.fb.group({
    app_id: [0, Validators.required],
    app_version: ['', Validators.required],
    amount: [0, Validators.required],
    method: [Payment.AliPay, Validators.required],
  });
  success = false;
  ngOnInit() {
    this.dialogRef.nativeElement.showModal();
    this.dialogRef.nativeElement.addEventListener('close', () => {
      console.log('close');
      if (this.success) {
        this.buyService.buyDialogShow$.next(null);
      } else {
        this.cancel.next();
      }
    });
    console.error({ soft: this.soft });
    this.form.patchValue({
      app_id: this.soft.id,
      app_version: this.soft.package.remoteVersion,
      amount: this.soft.pricing.price,
    });
  }
  failedButton() {
    this.dialogRef.nativeElement.close();
  }
  async submit() {
    console.log(this.form);
    const result = await this.orderService.post(this.form.value);
    DstoreObject.openURL(result.pay_url);
    this.payment$ = timer(0, 3000).pipe(
      switchMap(async () => {
        const order = await this.orderService.get(result.order_number as any);
        if (order.status === OrderStatus.OrderStatusSuccess) {
          this.success = true;
          this.buyService.buy$.next(this.soft);
        }
        return order;
      }),
      share(),
    );
  }
}
