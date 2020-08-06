import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'environments/environment';
import { switchMap } from 'rxjs/operators';

import { DstoreObject } from 'app/modules/client/utils/dstore-objects';
import { ThemeService } from 'app/services/theme.service';
import { SearchService } from 'app/services/search.service';
import { SysFontService } from 'app/services/sys-font.service';
import { MenuService } from 'app/services/menu.service';
import { SoftwareService, Software } from 'app/services/software.service';
import { ClientService, RequestErrorType } from 'app/services/client.service';
import { BuyService } from 'app/services/buy.service';

@Component({
  selector: 'dstore-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  constructor(
    private router: Router,
    private themeService: ThemeService,
    private sysFontService: SysFontService,
    private menuService: MenuService,
    private searchService: SearchService,
    private softwareService: SoftwareService,
    private clientService: ClientService,
    private buyService: BuyService
  ) {}

  buyDialogShow$ = this.buyService.buyDialogShow$;

  ngOnInit(): void {
    console.log(this.clientService.store);
    this.switchTheme();
    this.switchActiveColor();
    if (!environment.native) {
      return;
    }
    this.searchNavigate();
    this.controlNavigate();
    this.switchFont();
    this.screenshotPreview();
    this.menuService.serve();
  }
  // switch theme dark or light
  switchTheme() {
    this.themeService.getTheme().subscribe(theme => {
      console.log('主题切换', theme);
      document.body.className = theme;
    });
  }
  switchActiveColor() {
    this.themeService.getActiveColor().subscribe(activeColor => {
      document.getElementsByTagName('html')[0].style.setProperty("--activityColor",activeColor)
      document.getElementsByTagName('html')[0].style.setProperty("--activityColorHover",this.themeService.switchActiveColor(activeColor))
    })
  }
  // switch font family and font size
  switchFont() {
    document.querySelector("html").style.fontSize = environment.fontSize+"px";
    this.sysFontService.fontChange$.subscribe(([fontFamily, fontSize]) => {
      const HTMLGlobal = document.querySelector('html');
      HTMLGlobal.style.fontFamily = fontFamily;
      HTMLGlobal.style.fontSize = fontSize + 'px';
    });
  }
  // preview software screenshot
  screenshotPreview() {
    DstoreObject.openOnlineImage().subscribe(src => {
      fetch(src)
        .then(resp => resp.blob())
        .then(blob => {
          return new Promise<string>(resolve => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        })
        .then(data => {
          DstoreObject.imageViewer(src, data.slice(data.indexOf(',') + 1));
        });
    });
  }
  // search navigate
  searchNavigate() {
    this.searchService.openApp$.subscribe(id => {
      this.router.navigate(['/list', 'keyword', id, id]);
    });
    this.searchService.openSearchResult$.subscribe(keyword => {
      this.router.navigate(['/list', 'keyword', keyword]);
    });
    this.searchService.requestComplement$.subscribe(async keyword => {
      let list = [];
      for (let offset = 0; list.length < 10; offset += 20) {
        const softs = await this.softwareService.list({ keyword, offset });
        if (softs.length === 0) {
          break;
        }
        list = list
          .concat(softs.map(soft => ({ id: soft.id, name: soft.id.toString(), local_name: soft.info.name })))
          .slice(0, 10);
      }
      console.log('search result', { list });
      this.searchService.setComplementList(list);
    });
  }
  // control navigate
  async controlNavigate() {
    this.clientService.onRequestOpenCategory().subscribe(req => {
      this.router.navigate(['/list', 'category', req.category]);
      this.clientService.requestFinished({ req_id: req.req_id });
    });
    this.clientService.onRequestOpenTag().subscribe(req => {
      this.router.navigate(['/list', 'tag', req.tag]);
      this.clientService.requestFinished({ req_id: req.req_id });
    });
    this.clientService
      .onAppRequest()
      .pipe(
        switchMap(async body => {
          try {
            let soft: Software;
            if (body.pkg_url) {
              let softs = await this.softwareService.list({}, { locale_name: body.pkg_url });
              if (softs.length !== 1) {
                softs = await this.softwareService.list({ keyword: body.pkg_url });
              }
              if (softs.length > 1) {
                this.router.navigate(['/list', 'keyword', body.pkg_url]);
                throw RequestErrorType.AppMultiple;
              }
              soft = softs[0];
              if (!soft) {
                throw RequestErrorType.AppNotFound;
              }
            }
            if (['install', 'uninstall', 'update'].includes(body.type)) {
              this.router.navigate(['/list', 'keyword', soft.id, soft.id]);
            }
            switch (body.type) {
              case 'install':
                if (soft.package.localVersion) {
                  throw RequestErrorType.AppInstalled;
                }
                break;
              case 'uninstall':
                if (!soft.package.localVersion) {
                  throw RequestErrorType.AppNotInstalled;
                }
                break;
              case 'update':
                if (!soft.package.localVersion) {
                  throw RequestErrorType.AppNotInstalled;
                }
                if (!soft.package.upgradable) {
                  throw RequestErrorType.AppIsLatest;
                }
                break;
              case 'update_all':
                this.router.navigate(['/my/apps/local']);
            }
            this.clientService.requestFinished({ req_id: body.req_id });
          } catch (err) {
            if (typeof err === 'string') {
              this.clientService.requestFinished({ req_id: body.req_id, error_type: err as RequestErrorType });
              return;
            }
            if (err instanceof HttpErrorResponse) {
              this.clientService.requestFinished({ req_id: body.req_id, error_type: RequestErrorType.NetworkError });
              return;
            }
            // 未知错误，也返回网络错误
            this.clientService.requestFinished({ req_id: body.req_id, error_type: RequestErrorType.NetworkError });
            console.log('err', err);
          }
        }),
      )
      .subscribe();
  }
}
