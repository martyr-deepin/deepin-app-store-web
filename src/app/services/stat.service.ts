import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIBase, ListOption } from './api';

@Injectable({
  providedIn: 'root',
})
export class StatService extends APIBase<AppStat> {
  constructor(private http: HttpClient) {
    super(http, '/api/public/stat');
  }
  list(opt?: StatListOption) {
    return super.list(opt);
  }
}

interface StatListOption extends ListOption {
  order?: 'score' | 'download';
  id?: number[];
  category?: string;
  tag?: string;
  author?: number;
  keyword: string;
}
export interface AppStat {
  app_id: number;
  download_count: number; // 下载量
  score_count: number; // 评分数量
  score_total: number; // 总评分
}
