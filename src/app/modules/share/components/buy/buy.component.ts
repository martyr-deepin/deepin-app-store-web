import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { timer, Observable, of } from 'rxjs';
import { switchMap, share } from 'rxjs/operators';
import { Software, SoftwareService } from 'app/services/software.service';
import { Payment } from 'app/services/payment';
import { OrderService, OrderStatus, OrderJSON } from '../../../../services/order.service';
import { DstoreObject } from 'app/modules/client/utils/dstore-objects';
import { BuyService } from 'app/services/buy.service';
import { toCanvas, toDataURL } from 'qrcode';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'm-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.scss'],
})
export class BuyComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private buyService: BuyService,
    private softwareService: SoftwareService,
    private router: Router,
    private activeRouter: ActivatedRoute,
  ) {}
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
    method: ['', Validators.required],
  });
  //支付类型
  payType = null;
  paymentList = [
    { name: 'alipay', region: 'CNY' },
    { name: 'wechat', region: 'CNY' },
    // { name: 'paypal', region: 'USD' },
  ];

  qrCode = '';
  success = false;
  order: OrderJSON;

  ngOnInit() {
    console.log(this.qrCode);
    this.dialogRef.nativeElement.showModal();
    this.dialogRef.nativeElement.addEventListener('close', () => {
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
    const getAppInfo = await this.softwareService.list({ ids: [this.soft.id] }).then(soft => soft[0]);
    if (!getAppInfo.active) {
      window.location.reload();
      return;
    }
    this.payType = this.form.get('method').value;

    const result = await this.orderService.payment(this.form.value);

    switch (this.payType) {
      case Payment.AliPay:
        DstoreObject.openURL(result.pay_url);
        break;
      case Payment.WeChat:
        //this.qrCode = await toDataURL('jianghao', { rendererOpts: { quality: 1 } });
        this.qrCode = await toDataURL(result.pay_url, { rendererOpts: { quality: 1 } });
        console.log(this.qrCode);
        break;
    }
    // DstoreObject.openURL(result.pay_url);
    this.payment$ = timer(0, 3000).pipe(
      switchMap(async () => {
        if (this.success) {
          return this.order;
        }
        try {
          const order = await this.orderService.get(result.order_number as any);
          if (order.status === OrderStatus.OrderStatusSuccess) {
            this.success = true;
            this.order = order;
            this.buyService.buy$.next(this.soft);
          }
          return order;
        } catch (error) {
          return { status: 'netWokrError' } as OrderJSON;
        }
      }),
      share(),
    );
  }
}
enum regionByType {
  china = 'CNY',
  other = 'USD',
}
