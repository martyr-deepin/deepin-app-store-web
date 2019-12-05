import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIBase } from 'app/services/api';
import { Payment } from 'app/services/payment';
@Injectable({
  providedIn: 'root',
})
export class OrderService extends APIBase<OrderJSON> {
  constructor(private http: HttpClient) {
    super(http, '/api/user/alipay/order');
  }
  payment(params: buyParams) {
    let url = '';
    if (params.method === Payment.WeChat) {
      url = '/api/user/wechat/order';
    } else if (params.method === Payment.AliPay) {
      url = '/api/user/alipay/order';
    }
    return this.http.post<OrderJSON>(url, params).toPromise();
  }
}

export interface OrderJSON {
  amount: number;
  app_author: number;
  app_id: number;
  created_at: string;
  id: number;
  order_number: string;
  pay_method: string;
  pay_url: string;
  reason: string;
  status: string;
  updated_at: string;
  user_id: number;
}

export enum OrderStatus {
  OrderStatusWaiting = 'waiting',
  OrderStatusSuccess = 'success',
  OrderStatusFailure = 'failure',
}
interface buyParams {
  app_id: number;
  app_version: string;
  amount: number;
  method: string;
}
