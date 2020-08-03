import { Component, OnInit, NgZone } from '@angular/core';
import { environment } from 'environments/environment';
import { first, filter } from 'rxjs/operators';

import { RegionService } from './services/region.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private zone: NgZone, private region: RegionService, private auth: AuthService) {}
  title = 'deepin-app-store-web';
  installing = true;
  ngOnInit() {
    this.init().finally(() => {
      this.installing = false;
      console.log(new Date().getTime());
      const loading = document.getElementById('loading');
      document.body.removeChild(loading);
    });
  }
  async init() {
    await this.initChannel();
    await this.auth.init();
    await this.selectRegion();
  }
  async initChannel() {
    console.log('channel');

    const QWebChannel = window['QWebChannel'];
    if (QWebChannel) {
      // Native client mode.
      // js call ==> dstore channel ==> proxy channel >> c++ call
      // proxy channel
      const channelTransport = await new Promise<any>((resolve) => {
        return new QWebChannel(window['qt'].webChannelTransport, resolve);
      });
      // dstore channel
      const channel = await new Promise<any>((resolve) => {
        const t = {
          send(msg: any) {
            channelTransport.objects.channelProxy.send(msg);
          },
          onmessage(msg: any) {},
        };
        channelTransport.objects.channelProxy.message.connect((msg) => {
          this.zone.run(() => {
            t.onmessage({ data: msg });
          });
        });
        return new QWebChannel(t, resolve);
      });

      window['dstore'] = { channel };

      const settings = await new Promise<Settings>((resolve) => {
        channel.objects.settings.getSettings(resolve);
      });
      console.log('dstore client config', JSON.stringify(settings));
      if (environment.production) {
        environment.supportSignIn = settings.supportSignIn;
        environment.region = settings.defaultRegion;
        environment.autoSelect = settings.allowSwitchRegion;
        environment.operationList = settings.operationServerMap;
        environment.metadataServer = settings.metadataServer;
        environment.operationServer = environment.operationList[environment.region];
        environment.appStoreType = settings.appStoreType;
        environment.server = settings.server;
        environment.store_env.arch = settings.arch;
        environment.store_env.mode = settings.desktopMode;
        environment.store_env.platform = settings.product;
        environment.store_env.display = settings.GUIFramework;
        environment.remoteDebug = settings.remoteDebug;
        environment.authorizationState = settings.authorizationState;
      }
      // native client inited
      environment.native = true;

      //init theme
      if (settings.themeName) {
        environment.themeName = settings.themeName;
      }
      //init active color
      if (settings.activeColor) {
        environment.activeColor = settings.activeColor;
      }
      //init app version
      if (settings.appStoreVersion) {
        environment.store_env.client_version = settings.appStoreVersion;
      }
      if (settings.productName) {
        environment.store_env.product_name = settings.productName;
      }
    }
  }

  async selectRegion() {
    const info = await this.auth.info$
      .pipe(
        filter((v) => v !== undefined),
        first(),
      )
      .toPromise();
    if (info) {
      environment.store_env.region = info.region;
    } else {
      const code = await this.region.region();
      environment.store_env.region = code;
    }
  }
}

interface Settings {
  allowShowPackageName: boolean;
  allowSwitchRegion: boolean;
  autoInstall: boolean;
  defaultRegion: string;
  metadataServer: string;
  operationServerMap: { [key: string]: string };
  remoteDebug: boolean;
  supportAot: boolean;
  supportSignIn: boolean;
  themeName: string;
  upyunBannerVisible: boolean;
  server: string;
  arch: string;
  desktopMode: string;
  product: string;
  GUIFramework: string;
  authorizationState: number;
  activeColor: string;
  appStoreVersion: string;
  productName: string;
  appStoreType;
}
