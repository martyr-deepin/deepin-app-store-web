import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIBase, ListOption } from './api';
import { isDeepStrictEqual } from 'util';
import { isEqual } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class AppService extends APIBase<AppJSON> {
  constructor(private http: HttpClient) {
    super(http, '/api/public/app');
  }

  private resp:Promise<{items:AppJSON[],count:number}>;
  private opt:AppListOption;
  private cacheTime:number=0;
  private cacheSlot:number=1000;

  list(opt?: AppListOption) {
    let time = new Date().getTime()
    if((time-this.cacheTime)>this.cacheSlot || !isEqual(this.opt,opt) ) {
      this.cacheTime = new Date().getTime()
      this.opt = opt;
      this.resp = super.list(opt);
    }
    return this.resp;    
  }
}
interface AppListOption extends ListOption {
  id?: number[];
  active?: boolean | '';
}

export interface AppJSON {
  id: number;
  review_id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: any;
  name: string;
  package_name: string;
  package_veersion: string;
  author: number;
  active: boolean;
  skip: boolean;
  info: Info;
  operation?: any;
  packages: Package[];
  version: string;
  free: boolean;
  pricings: Pricing[];
}

interface Info {
  origin: number;
  remark: string;
  category: string;
  email: string;
  official_site: string;
  default_language: string;
  locales: Locale[];
}

interface Locale {
  language: string;
  name: string;
  slogan: string;
  description: string;
  changelog: string;
  icon: string;
  cover: string;
  tags: string[];
  screenshots: string[];
}

interface Package {
  name: string;
  blob: string;
  signed: boolean;
  size: number;
  publish_status: string;
  version: string;
}
export interface Pricing {
  price: number;
  currency: 'CNY' | 'USD';
  region_id: number;
}
