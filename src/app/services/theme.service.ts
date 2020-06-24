import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'environments/environment';
import { Channel } from 'app/modules/client/utils/channel';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private theme$ = new BehaviorSubject<string>(environment.themeName);
  private activeColor$ = new BehaviorSubject<string>(environment.activeColor);

  constructor() {
    Channel.connect<string>('menu.switchThemeRequested').subscribe(theme => {
      this.theme$.next(theme);
    });

    // Request to update system activety color
    Channel.connect<string>('settings.activeColorChanged').subscribe(activeColor => {
      console.log(activeColor)
      this.activeColor$.next(activeColor)
    })
  }
  getTheme() {
    return this.theme$.asObservable();
  }

  getActiveColor(){
    return this.activeColor$.asObservable();
  }

  switchActiveColor(color:string) {
    let result = "#0081FF"
    switch (color.toUpperCase()) {
      case '#D8316C':
        result = "#E05A8B"
        break;
      case '#FF5D00':
        result = "#FF7A33"
        break;
      case '#F8CB00':
        result = "#FFD92D"
        break;
      case '#23C400':
        result = "#31FF03"
        break;
      case '#00A48A':
        result = "#00E8C2"
        break;
      case '#0081FF':
        result = "#339DFF"
        break;
      case '#3C02FF':
        result = "#6135FF"
        break;
      case '#6A0085':
        result = "#A100CE"
        break;
      case '#4D4D4D':
        result = "#707070"
        break;
    }
    return result;
  }

  plusRgb(color:string,r:number,g:number,b:number) {
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    var sColor = color.toLowerCase();
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        var sColorNew = "#";
        for (var i=1; i<4; i+=1) {
          sColorNew += sColor.slice(i, i+1).concat(sColor.slice(i, i+1));    
        }
        sColor = sColorNew;
      }
      //处理六位的颜色值
      var sColorChange = [];
      for (var i=1; i<7; i+=2) {
        sColorChange.push(parseInt("0x"+sColor.slice(i, i+2)));    
      }
      sColorChange[0] = sColorChange[0]+r;
      sColorChange[1] = sColorChange[1]+g;
      sColorChange[2] = sColorChange[2]+b;
      return "RGB(" + sColorChange.join(",") + ")";
    }
  }
}