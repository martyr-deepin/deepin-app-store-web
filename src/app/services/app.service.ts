import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIBase, ListOption } from './api';

@Injectable({
  providedIn: 'root',
})
export class AppService extends APIBase<AppJSON> {
  constructor(private http: HttpClient) {
    super(http, '/api/public/app');
  }
  list(opt?: AppListOption) {
    return super.list(opt);
  }
}
interface AppListOption extends ListOption {
  id?: number[];
  active?: boolean | '';
}

export interface AppJSON {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: any;
  name: string;
  package_name: string;
  author: number;
  active: boolean;
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
  version: string;
}
export interface Pricing {
  price: number;
  region_id: number;
}
