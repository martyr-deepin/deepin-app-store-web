import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIBase, ListOption } from './api';
import { isEqual } from 'lodash';
import {environment} from 'environments/environment'

@Injectable({
  providedIn: 'root',
})
export class StatService extends APIBase<AppStat> {
  constructor(private http: HttpClient) {
    super(http, '/api/public/stat');
  }

  private resp:Promise<{items:AppStat[],count:number}>;
  private opt:StatListOption;
  private cacheTime:number=0;
  private cacheSlot:number=1000;

  list(opt?: StatListOption) {
    let time = new Date().getTime()
    if((time-this.cacheTime)>this.cacheSlot || !isEqual(this.opt,opt)) {
      this.cacheTime = new Date().getTime()
      this.opt = opt;
      this.resp = super.list(opt);
    }
    return this.resp;    
  }
}

interface StatListOption extends ListOption {
  order?: 'score' | 'download';
  id?: number[];
  category?: string;
  tag?: string;
  author?: number;
  keyword: string;
  version: string;
}
export interface AppStat {
  app_id: number;
  download_count: number; // 下载量
  score_count: number; // 评分数量
  score_total: number; // 总评分
}
