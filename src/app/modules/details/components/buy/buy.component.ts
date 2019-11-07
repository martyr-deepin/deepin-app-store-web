import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { timer, Observable } from 'rxjs';
import { switchMap, share } from 'rxjs/operators';
import { Software } from 'app/services/software.service';
import { Payment } from '../../services/payment';
import { OrderService, OrderStatus, OrderJSON } from '../../../../services/order.service';
import { DstoreObject } from 'app/modules/client/utils/dstore-objects';

@Component({
  selector: 'm-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.scss'],
})
export class BuyComponent implements OnInit {
  constructor(private fb: FormBuilder, private orderService: OrderService) {}
  readonly Payment = Payment;
  readonly OrderStatus = OrderStatus;
  @ViewChild('dialogRef', { static: true }) dialogRef: ElementRef<HTMLDialogElement>;
  @Input() soft: Software;
  payment$: Observable<OrderJSON> = null;
  form = this.fb.group({
    app_id: [0, Validators.required],
    app_version: ['', Validators.required],
    amount: [0, Validators.required],
    method: [Payment.AliPay, Validators.required],
  });
  ngOnInit() {
    this.dialogRef.nativeElement.showModal();
    this.form.patchValue({
      app_id: this.soft.id,
      app_version: this.soft.package.remoteVersion,
      amount: this.soft.pricing.price,
    });
  }
  async submit() {
    const result = await this.orderService.post(this.form.value);
    DstoreObject.openURL(result.pay_url);
    this.payment$ = timer(0, 3000).pipe(
      switchMap(async () => {
        const order = await this.orderService.get(result.order_number as any);
        return order;
      }),
      share(),
    );
  }
}
