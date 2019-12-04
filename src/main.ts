import { enableProdMode, TRANSLATIONS, TRANSLATIONS_FORMAT, MissingTranslationStrategy, NgZone } from '@angular/core';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from 'environments/environment';
import { transition } from '@angular/animations';

if (environment.production) {
  enableProdMode();
}

// use the require method provided by webpack
declare const require;
//  qt web channel run ng zone
let zone: NgZone = null;

async function main() {
  // Client mode
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
        if (!zone) {
          t.onmessage({ data: msg });
        } else {
          zone.run(() => {
            t.onmessage({ data: msg });
          });
        }
      });
      return new QWebChannel(t, resolve);
    });

    window['dstore'] = { channel };

    const settings = await new Promise<Settings>(resolve => {
      channel.objects.settings.getSettings(resolve);
    });
    console.log('dstore client config', settings);
    environment.native = true;
    if (settings.themeName) {
      environment.themeName = settings.themeName;
    }
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
      environment.remoteDebug = settings.remoteDebug;
    }
  }

  // if (!Boolean(settings['aot'])) {
  // loading i18n files
  for (let language of navigator.languages) {
    language = language.replace('-', '_');
    if (language === 'zh') {
      language = 'zh_CN';
    }
    try {
      const translations: { default: string } = require(`raw-loader!./locale/messages.${language}.xlf`);
      if (translations) {
        environment.locale = language;
        environment.store_env.language = language;
        return bootstrap(translations.default);
      }
    } catch (err) {
      console.error('cannot load locale', language, err);
    }
  }
  return bootstrap();
}

function bootstrap(translations = null) {
  let opt = {};
  if (translations) {
    opt = {
      missingTranslation: MissingTranslationStrategy.Warning,
      providers: [
        { provide: TRANSLATIONS, useValue: translations },
        { provide: TRANSLATIONS_FORMAT, useValue: 'xlf' },
      ],
    };
  }
  console.log(opt);
  return platformBrowserDynamic().bootstrapModule(AppModule, opt);
}

main()
  .catch(err => {
    console.error('load locale fail', err);
    return bootstrap();
  })
  .then(app => {
    window['app'] = app;
    zone = app.injector.get(NgZone);
  })
  .catch(err => console.error(err))
  .finally(() => console.log('bootstrap'));

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
}
