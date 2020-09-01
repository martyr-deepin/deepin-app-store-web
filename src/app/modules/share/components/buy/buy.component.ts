import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { timer, Observable } from 'rxjs';
import { switchMap, share } from 'rxjs/operators';
import { Software, SoftwareService } from 'app/services/software.service';
import { Payment } from 'app/services/payment';
import { OrderService, OrderStatus, OrderJSON, PayStatus } from '../../../../services/order.service';
import { DstoreObject } from 'app/modules/client/utils/dstore-objects';
import { BuyService } from 'app/services/buy.service';
import {toDataURL } from 'qrcode';
import { StoreService } from 'app/modules/client/services/store.service';
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
    private storeService: StoreService,
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
    third: ['', Validators.required],
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
    console.log({ soft: this.soft });
    this.form.patchValue({
      app_id: this.soft.id,
      app_version: this.soft.package.remoteVersion || this.soft.info.packages[0].remoteVersion,
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
    this.payType = this.form.get('third').value;

    const result = await this.orderService.payment(this.form.value);
    result.pay_method = this.payType;
    result.created_at = new Date().getTime();

    switch (this.payType) {
      case Payment.AliPay:
        DstoreObject.openURL(result.url);
        break;
      case Payment.WeChat:
        //this.qrCode = await toDataURL('jianghao', { rendererOpts: { quality: 1 } });
        this.qrCode = await toDataURL(result.url, { rendererOpts: { quality: 1 } });
        console.log(this.qrCode);
        break;
    }
    // DstoreObject.openURL(result.pay_url);
    this.payment$ = timer(0, 3000).pipe(
      switchMap(async () => {
        if (this.success) {
          return result;
        }
        try {
          const orderStatus = await this.orderService.get(result.order_number+"/status" as any);
          result.status = orderStatus.status;
          if (orderStatus.status === OrderStatus.OrderStatusSuccess) {
            this.success = true;
            //this.order = order;
            this.storeService.appPayStatus({ appId: this.soft.package_name, status: PayStatus.Payed });
            this.buyService.buy$.next(this.soft);
          }
          return result;
        } catch (error) {
          return { status: 3 } as OrderJSON;
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
