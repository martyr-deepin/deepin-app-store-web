import { Injectable } from '@angular/core';
import { Channel } from 'app/modules/client/utils/channel';

@Injectable({
  providedIn: 'root',
})
export class AutoInstallService {
  constructor() {}
  setAutoInstall(auto: boolean) {
    return Channel.exec('settings.setAutoInstall', auto);
  }
  getAutoInstall() {
    return Channel.exec<{ autoInstall: boolean }>('settings.getSettings').then(v => v.autoInstall);
  }
}
