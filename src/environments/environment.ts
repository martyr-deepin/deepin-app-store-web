// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  // Default server address only used in browser mode.

  operationList: {
    CN: 'http://10.0.10.70:18100',
    Default: 'http://10.0.10.67:18100',
  } as { [key: string]: string },
  region: 'Default', // 0:China 1:International
  autoSelect: true, // auto select operation by ip
  operationServer: '', // operation server

  metadataServer: 'http://10.0.10.70:18000', //metadata server
  themeName: 'light', // theme
  locale: 'zh_CN', // language
  native: false, // native or browser
  supportSignIn: true, // support sign in
  store_version: 0,

  // server: 'http://localhost:19000',
  server: 'http://test.store.deepin.com',
  store_env: {
    arch: 'amd64',
    mode: 'desktop',
    platform: 'professional',
    region: 'CN',
    language: 'en_US',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/dist/zone-error'; // Included with Angular CLI.
