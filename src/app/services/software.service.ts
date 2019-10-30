import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from 'environments/environment';
import { map, tap, switchMap, first } from 'rxjs/operators';
import { StoreService, Package } from 'app/modules/client/services/store.service';
import { Category, CategoryService } from './category.service';
import { PackageService } from './package.service';
import { DownloadTotalService } from './download-total.service';
import { AppService, AppJSON } from './app.service';
import { StatService, AppStat } from './stat.service';

@Injectable({
  providedIn: 'root',
})
export class SoftwareService {
  constructor(
    private http: HttpClient,
    private appService: AppService,
    private statService: StatService,
    private categoryService: CategoryService,
    private storeService: StoreService,
    private packageService: PackageService,
    private downloadCounter: DownloadTotalService,
  ) {}
  private readonly native = environment.native;
  private readonly metadataURL = environment.metadataServer + '/api/v3/apps';
  // operation app url
  private readonly operationURL = environment.operationServer + '/api/v3/apps';
  packages = this.http.get<PackagesURL>(environment.metadataServer + '/api/v3/packages').toPromise();

  async list({
    order = 'download' as 'download' | 'score',
    offset = 0,
    limit = 20,
    category = '',
    tag = '',
    keyword = '',
    author = '',
    names = [] as string[],
    ids = [] as number[],
    active = true as boolean | '',
  }) {
    const stats = await this.statService.list({ order, offset, limit, category, tag, keyword, id: ids });
    const apps = await this.appService.list({ id: stats.items.map(stat => stat.app_id), active });
    const m = new Map<number, AppJSON>(apps.items.map(app => [app.id, app]));
    return stats.items
      .filter(stat => m.has(stat.app_id))
      .map(stat => this.convertApp(m.get(stat.app_id), stat))
      .filter(Boolean);
  }
  private coverImage(img: string) {
    if (!img) {
      return '';
    }
    return environment.server + '/api/public/blob/' + img;
  }
  private convertApp(app: AppJSON, stat: AppStat) {
    let locale = app.info.locales.find(l => l.language === environment.locale);
    if (!locale) {
      locale = app.info.locales.find(l => l.language === 'en_US');
    }
    if (!locale) {
      locale = app.info.locales[0];
      if (!locale) {
        console.error('Not found locale', app);
        return null;
      }
    }
    const soft: Software = {
      id: app.id,
      name: app.name,
      active: app.active,
      created_at: app.created_at,
      updated_at: app.updated_at,
      stat: {
        name: app.name,
        score: stat.score_total / stat.score_count,
        score_count: stat.score_count,
        download: stat.download_count,
      },
      info: {
        author: app.author,
        category: app.info.category,
        homePage: app.info.official_site,
        source: app.info.origin,
        icon: this.coverImage(locale.icon),
        cover: this.coverImage(locale.cover),
        screenshot: locale.screenshots.map(img => this.coverImage(img)),
        locale: locale.language,
        name: locale.name,
        slogan: locale.slogan,
        description: locale.description,
        tags: locale.tags,
        packages: app.packages.map(pkg => ({ packageURI: pkg.name })),
      },
      package: {
        remoteVersion: app.packages[0].version,
        localVersion: '',
      },
    };
    return soft;
  }

  // software convert to package query
  private toQuery(soft: Software) {
    return {
      name: soft.name,
      localName: soft.info.name,
      packages: soft.info.packages,
    };
  }

  // software download size
  size(soft: Software) {
    return this.storeService.queryDownloadSize([this.toQuery(soft)]).toPromise();
  }
  // open software
  open(soft: Software) {
    return this.storeService.execWithCallback('storeDaemon.openApp', this.toQuery(soft)).toPromise();
  }
  // remove software
  remove(...softs: Software[]) {
    return this.storeService.execWithCallback('storeDaemon.removePackages', softs.map(this.toQuery)).toPromise();
  }
  // install software
  install(...softs: Software[]) {
    this.downloadCounter.installed(softs);
    return this.storeService.execWithCallback('storeDaemon.installPackages', softs.map(this.toQuery)).toPromise();
  }
}

interface Locale {
  locale: string;
}

export function sortByLocale(a: Locale, b: Locale) {
  const level = [environment.locale, 'en_US', 'zh_CN'];
  return level.indexOf(a.locale) - level.indexOf(b.locale);
}

export function localeFilter(arr: Locale[]): any[] {
  if (arr.some(v => v.locale === environment.locale)) {
    return arr.filter(v => v.locale === environment.locale);
  }
  return arr.filter(v => v.locale === 'en_US');
}

// 软件信息
interface Info extends Desc {
  author: number;
  category: string;
  homePage: string;
  icon: string;
  packageURI?: string;
  source: Source;
  tags: any[];
  cover: string;
  screenshot: string[];

  packager?: string;
  packages?: { packageURI: string }[];
  extra?: {};
  versions?: any[];
}
export interface Software {
  id: number;
  created_at: string;
  updated_at: string;
  active: boolean;
  name: string;
  info: Info;
  stat: Stat;
  package?: {
    localVersion: string;
    remoteVersion: string;
  };
  // 下面是服务器返回结构，全部解析到info内部
  desc?: Desc;
  versions?: any;
  tags?: any[];
  images?: Image[];
}

interface Desc {
  locale: string;
  name: string;
  description: string;
  slogan: string;
}

interface Image {
  locale: string;
  path: string;
  type: number;
  order: number;
}
export enum ImageType {
  Invalid,
  Icon,
  Cover,
  CoverHD,
  Screenshot,
  ScreenshotHD,
}
export interface Stat {
  name: string;
  score: number;
  score_count: number;
  download: number;
}
export enum Source {
  ThirdParty = 0,
  Official = 1,
  Collaborative = 2,
}

export interface PackagesURL {
  [key: string]: {
    name: string;
  };
}
