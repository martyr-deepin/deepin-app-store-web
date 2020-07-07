import { Component, OnInit, NgZone } from '@angular/core';
import { environment } from 'environments/environment';
import { first, filter } from 'rxjs/operators';

import { RegionService } from './services/region.service';
import { AuthService } from './services/auth.service';

import { StoreService } from './modules/client/services/store.service';
import { StoreJobStatus } from 'app/modules/client/models/store-job-info';

@Component({
  selector: 'm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private zone: NgZone,
    private region: RegionService,
    private auth: AuthService,
    private store: StoreService,
  ) {}
  title = 'deepin-app-store-web';
  installing = true;
  ngOnInit() {
    this.init().finally(() => {
      this.installing = false;

      console.log(new Date().getTime());
      const loading = document.getElementById('loading');
      const main = document.getElementById('main');
      loading.style.display = 'none';
      main.style.display = 'block';
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
      const channelTransport = await new Promise<any>(resolve => {
        return new QWebChannel(window['qt'].webChannelTransport, resolve);
      });
      // dstore channel
      const channel = await new Promise<any>(resolve => {
        const t = {
          send(msg: any) {
            channelTransport.objects.channelProxy.send(msg);
          },
          onmessage(msg: any) {},
        };
        channelTransport.objects.channelProxy.message.connect(msg => {
          this.zone.run(() => {
            t.onmessage({ data: msg });
          });
        });
        return new QWebChannel(t, resolve);
      });

      window['dstore'] = { channel };

      const settings = await new Promise<Settings>(resolve => {
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

        environment.server = settings.server;
        environment.store_env.arch = settings.arch;
        environment.store_env.mode = settings.desktopMode;
        environment.store_env.platform = settings.product;
        environment.store_env.display = settings.GUIFramework;
        environment.remoteDebug = settings.remoteDebug;
        environment.authorizationState = settings.authorizationState;
      }
      if (settings.themeName) {
        environment.themeName = settings.themeName;
      }
      if(settings.appStoreVersion) {
        environment.store_env.version = settings.appStoreVersion;
      }
      if(settings.productName) {
        environment.store_env.product_name = settings.productName;
      }
      // exec apt update
      //if (AuthorizationState.includes(environment.authorizationState)) {
        const storeUpdate = 'storeUpdate';
        const t = new Date().toISOString();
        if (!localStorage.getItem(storeUpdate)) {
          console.warn('store first update');
          const jobID = await this.store.storeUpdate().toPromise();
          if (jobID) {
            await new Promise(resolve => {
              const interval = setInterval(() => {
                this.store
                  .getJobStatus(jobID)
                  .toPromise()
                  .then(({ status }) => {
                    if (status !== StoreJobStatus.running) {
                      resolve();
                      clearInterval(interval);
                    }
                  })
                  .catch(() => {
                    resolve();
                    clearInterval(interval);
                  });
              }, 1000);
            });
          }
          localStorage.setItem(storeUpdate, t);
        } else {
          if (!sessionStorage.getItem(storeUpdate)) {
            console.warn('store update');
            setTimeout(() => {
              this.store
                .storeUpdate()
                .toPromise()
                .finally(() => sessionStorage.setItem('storeUpdate', t));
            }, 1000 * 5);
          }
        }
      //}
      // native client inited
      environment.native = true;
    }
  }

  async selectRegion() {
    const info = await this.auth.info$
      .pipe(
        filter(v => v !== undefined),
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
  appStoreVersion:string;
  productName:string;
}
