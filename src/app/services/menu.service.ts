import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Channel } from 'app/modules/client/utils/channel';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(private router: Router, private auth: AuthService) {}
  serve() {
    // menu user info
    this.auth.info$.subscribe(async dInfo => {
      //console.log('menu info', dInfo);
      if (!dInfo) {
        Channel.exec('menu.setUserInfo', {});
        return;
      }
      const avatar = await fetch(dInfo.profile_image).then(resp => resp.blob());
      //console.log(avatar);
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(avatar);
      });
      Channel.exec('menu.setUserInfo', {
        name: dInfo.username,
        uid: dInfo.uid,
        profile_image: data.slice(data.indexOf(',') + 1),
      });
    });
    // bind route
    this.connectToRouter('menu.appsRequested', '/my/apps');
    this.connectToRouter('menu.commentRequested', '/my/comments');
  }

  connectToRouter(signal: string, url: string) {
    Channel.connect(signal).subscribe(() => {
      this.router.navigateByUrl(url);
    });
  }
}
