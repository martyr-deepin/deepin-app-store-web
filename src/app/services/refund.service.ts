import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RefundService {
  constructor(private http: HttpClient) {}
  list(order_number: string) {
    return this.http.get<Refund[]>('/api/user/refund/' + order_number).toPromise();
  }
  create(order_number: string, request: { content: string; reason: string }) {
    return this.http.post('/api/user/refund/' + order_number, request).toPromise();
  }
}
interface Refund {
  id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
  order_number: string;
  amount: number;
  reviewer: number;
  status: string;
  reason: string;
  refund_user: RefundUser;
}

interface RefundUser {
  content: string;
  reason?: { id: number }[];
}

export enum RefundStatus {
  RefundStatusCreated = 'created',
  RefundStatusReviewing = 'reviewing',
  RefundStatusReject = 'reject',
  RefundStatusWaiting = 'waiting',
  RefundStatusSuccess = 'success',
  RefundStatusFailure = 'failure',
}

export enum RefundCode {
  Success = 0,
  Review,
  DataError,
  SysError,
  OrderDefind,
  OrderNotPay,
  TimeOut,
  NoPower,
  Successful,
  Refunding,
  Reviewing,
  orderCreated,
  fail,
  error
}
