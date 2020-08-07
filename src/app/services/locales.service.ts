import { Injectable } from '@angular/core';
import { registerLocaleData } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LocalesService {
  constructor() {}

  loadLocale(locale:string){
    let locale_data:any;
    switch(locale) {
      case 'zh':
        locale_data = require("@angular/common/locales/zh");
        break;
      case 'am':
        locale_data = require("@angular/common/locales/am");
        break;
      case 'ar':
        locale_data = require("@angular/common/locales/ar");
        break;
      case 'ast':
        locale_data = require("@angular/common/locales/ast");
        break;
      case 'az':
        locale_data = require("@angular/common/locales/az");
        break;
      case 'bg':
        locale_data = require("@angular/common/locales/bg");
        break;
      case 'ca':
        locale_data = require("@angular/common/locales/ca");
        break;
      case 'cs':
        locale_data = require("@angular/common/locales/cs");
        break;
      case 'da':
        locale_data = require("@angular/common/locales/da");
        break;
      case 'de':
        locale_data = require("@angular/common/locales/de");
        break;
      case 'el':
        locale_data = require("@angular/common/locales/el");
        break;
      case 'en':
        locale_data = require("@angular/common/locales/en");
        break;
      case 'es':
        locale_data = require("@angular/common/locales/es");
        break;
      case 'et':
        locale_data = require("@angular/common/locales/et");
        break;
      case 'fa':
        locale_data = require("@angular/common/locales/fa");
        break;
      case 'fi':
        locale_data = require("@angular/common/locales/fi");
        break;
      case 'fr':
        locale_data = require("@angular/common/locales/fr");
        break;
      case 'gl':
        locale_data = require("@angular/common/locales/gl");
        break;
      case 'hi':
        locale_data = require("@angular/common/locales/hi");
        break;
      case 'hr':
        locale_data = require("@angular/common/locales/hr");
        break;
      case 'hu':
        locale_data = require("@angular/common/locales/hu");
        break;
      case 'id':
        locale_data = require("@angular/common/locales/id");
        break;
      case 'it':
        locale_data = require("@angular/common/locales/it");
        break;
      case 'ja':
        locale_data = require("@angular/common/locales/ja");
        break;
      case 'kn':
        locale_data = require("@angular/common/locales/kn");
        break;
      case 'ko':
        locale_data = require("@angular/common/locales/ko");
        break;
      case 'lt':
        locale_data = require("@angular/common/locales/lt");
        break;
      case 'ms':
        locale_data = require("@angular/common/locales/ms");
        break;
      case 'ne':
        locale_data = require("@angular/common/locales/ne");
        break;
      case 'nl':
        locale_data = require("@angular/common/locales/nl");
        break;
      case 'pl':
        locale_data = require("@angular/common/locales/pl");
        break;
      case 'pt':
        locale_data = require("@angular/common/locales/pt");
        break;
      case 'ro':
        locale_data = require("@angular/common/locales/ro");
        break;
      case 'ru':
        locale_data = require("@angular/common/locales/ru");
        break;
      case 'sk':
        locale_data = require("@angular/common/locales/sk");
        break;
      case 'sr':
        locale_data = require("@angular/common/locales/sr");
        break;
      case 'sv':
        locale_data = require("@angular/common/locales/sv");
        break;
      case 'tr':
        locale_data = require("@angular/common/locales/tr");
        break;
      case 'ug':
        locale_data = require("@angular/common/locales/ug");
        break;
      case 'uk':
        locale_data = require("@angular/common/locales/uk");
        break;
      case 'vi':
        locale_data = require("@angular/common/locales/vi");
        break;
    }
    registerLocaleData(locale_data.default,locale)
  }
}
