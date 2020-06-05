import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'environments/environment';
import { switchMap } from 'rxjs/operators';
import { StoreService, Package, QueryParam } from 'app/modules/client/services/store.service';
import { PackageService } from './package.service';
import { DownloadTotalService } from './download-total.service';
import { AppService, AppJSON, Pricing } from './app.service';
import { StatService, AppStat } from './stat.service';
import { MessageService, MessageType } from './message.service';
import { BlacklistService } from './blacklist.service';
import { BlacklistOperation } from './blacklist';

@Injectable({
  providedIn: 'root',
})
export class SoftwareService {
  constructor(
    private http: HttpClient,
    private appService: AppService,
    private statService: StatService,
    private storeService: StoreService,
    private packageService: PackageService,
    private downloadCounter: DownloadTotalService,
    private messageService: MessageService,
    private blacklistService: BlacklistService,
  ) {
    // Uninstall software after refund
    this.messageService.onMessage<{ app_id: number }>(MessageType.Refund).subscribe(async (msg) => {
      const softs = await this.list({}, { id: [msg.app_id] });
      if (softs) {
        this.remove(...softs);
      }
    });
  }
  packages = this.http.get<PackagesURL>('/api/public/packages').toPromise();
  backlist$ = this.blacklistService.blacklist();

  async list(
    // 旧参数
    {
      offset = 0,
      limit = 20,
      category = '',
      tag = '',
      keyword = '',
      author = '',
      names = [] as string[],
      ids = [] as number[],
      active = true as boolean | '',
    },
    // 新参数
    param?: {
      id?: number[];
      locale_name?: string;
      package_name?: string[];
      offset?: number;
      limit?: number;
      order?: 'download' | 'score';
    },
    opt?: {
      noFilter?: boolean;
    },
  ) {
    // blacklist hidden
    const blacklist = await this.backlist$;
    // 获取应用统计信息接口
    let softs: Software[] = [];
    if (opt) {
      if (opt.noFilter) {
        const apps = await this.appService.list({ id: param.id });
        softs = apps.items.map((app) => this.convertApp(app)).filter(Boolean);
      }
    } else {
      const stats = await this.statService.list((param as any) || { offset, limit, category, tag, keyword, id: ids });
      const m = new Map<number, AppJSON>();
      if (stats.count > 0) {
        // hidden app based on blacklist
        stats.items = stats.items.filter((stat) => blacklist.get(stat.app_id) !== BlacklistOperation.Hidden);
        const apps = await this.appService.list({
          id: stats.items.map((stat) => stat.app_id),
          limit: param ? (param.limit ? param.limit : 20) : 20,
          active,
        });
        apps.items.forEach((app) => {
          if(app.info) {
            m.set(app.id, app)
          }
        });
      }
      softs = stats.items
        .filter((stat) => m.has(stat.app_id))
        .map((stat) => this.convertApp(m.get(stat.app_id), stat))
        .filter(Boolean);
    }
    if (!environment.native) {
      return softs;
    }
    if (ids.length > 0) {
      softs.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    }
    const pkgMap = await this.packageService.querys(softs.map(this.toQuery));
    return softs.map((soft) => {
      const pkg = pkgMap.get(soft.id.toString());
      if (pkg) {
        soft.package = { localVersion: pkg.localVersion, remoteVersion: pkg.remoteVersion, upgradable: pkg.upgradable };
        // disable app based on blacklist
        if (blacklist.get(soft.id) === BlacklistOperation.Disable) {
          soft.package.remoteVersion = '';
        }
      }
      return soft;
    });
  }

  private coverImage(img: string) {
    if (!img) {
      return '';
    }
    return environment.server + '/api/public/blob/' + img;
  }

  private convertApp(app: AppJSON, stat?: AppStat) {
    let locale = app.info.locales.find((l) => l.language === environment.locale);
    if (!locale) {
      locale = app.info.locales.find((l) => l.language === 'en_US');
    }
    if (!locale) {
      locale = app.info.locales[0];
      if (!locale) {
        console.error('Not found locale', app);
        return null;
      }
    }
    const appStat: Stat = {
      name: app.name,
      score: 0,
      score_count: 0,
      download: 0,
    };
    if (stat) {
      appStat.score = stat.score_total / stat.score_count;
      appStat.score_count = stat.score_count;
      appStat.download = stat.download_count;
    }
    const soft: Software = {
      id: app.id,
      name: app.name,
      package_name: app.package_name,
      author: app.author,
      active: app.active,
      created_at: app.created_at,
      updated_at: app.updated_at,
      stat: appStat,
      skip: app.skip,
      //skip: true,
      info: {
        author: app.author,
        category: app.info.category,
        homePage: app.info.official_site,
        source: app.info.origin,
        icon: this.coverImage(locale.icon),
        cover: this.coverImage(locale.cover),
        screenshot: locale.screenshots.map((img) => this.coverImage(img)),
        locale: locale.language,
        changelog: locale.changelog,
        name: locale.name,
        slogan: locale.slogan,
        description: locale.description,
        tags: locale.tags,
        packages: app.packages.map(pkg => ({ packageURI: 'dpk://deb/' + pkg.name,size: pkg.size })),
      },
      package: {
        remoteVersion: '',
        localVersion: '',
        upgradable: false
      },
      free: app.free,
      pricing: app.pricings[0],
    };
    return soft;
  }

  // software convert to package query
  private toQuery(soft: Software) {
    // console.log(soft, 'asdasd');
    return {
      name: soft.id && soft.id !== 0 ? soft.id.toString() : soft.package.appName,
      localName: soft.info.name,
      packages: soft.info.packages,
    } as QueryParam;
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
  query(soft: Software) {
    return this.packageService.query(this.toQuery(soft)).pipe(
      switchMap(async (v) => {
        // disable app based on blacklist
        if (v && v.remoteVersion) {
          const blacklist = await this.backlist$;
          if (blacklist.get(soft.id) === BlacklistOperation.Disable) {
            v = { ...v, remoteVersion: '' };
          }
        }
        return v;
      }),
    );
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
  if (arr.some((v) => v.locale === environment.locale)) {
    return arr.filter((v) => v.locale === environment.locale);
  }
  return arr.filter((v) => v.locale === 'en_US');
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
  packages?: { packageURI: string,size: number }[];
  extra?: {};
  versions?: any[];
}
export interface Software {
  id: number;
  created_at: string;
  updated_at: string;
  active: boolean;
  name: string;
  package_name: string;
  author: number;
  info: Info;
  stat: Stat;
  free: boolean;
  pricing: Pricing;
  skip: boolean,
  package?: {
    localVersion: string;
    remoteVersion: string;
    upgradable: boolean;
    appName?: string;
    icon?: string;
    size?:number;
  };
  // 下面是服务器返回结构，全部解析到info内部
  desc?: Desc;
  versions?: any;
  tags?: any[];
  images?: Image[];
  unavailable?: boolean;
}

interface Desc {
  locale: string;
  changelog: string;
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
    category: string;
    id: number;
    name: string;
    updated_at: string;
    locale: { [key: string]: { description: { name: string } } };
  };
}
