import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIBase } from 'app/services/api';

@Injectable({
  providedIn: 'root',
})
export class OrderService extends APIBase<OrderJSON> {
  constructor(private http: HttpClient) {
    super(http, '/api/user/order');
  }
  payment(params: buyParams) {
    return this.post(params)
  }
}

export interface OrderJSON {
  amount: number;
  app_author: number;
  app_id: number;
  created_at: number;
  id: number;
  order_number: string;
  pay_method: string;
  pay_url: string;
  url: string;
  reason: string;
  status: OrderStatus;
  updated_at: string;
  user_id: number;
}

export enum OrderStatus {
  OrderStatusWaiting = 0,
  OrderStatusSuccess = 1,
  OrderStatusFailure = 2,
  OrderStatusNetWorkError = 3,
}
interface buyParams {
  app_id: number;
  app_version: string;
  amount: number;
  method: string;
}

export interface AppPayStatus {
  appId:string,
  status:PayStatus,
}

export enum PayStatus {
  Payed = 0,
  Refunding,
  RefundSuccess,
  RefundFailed,
  Default,
}