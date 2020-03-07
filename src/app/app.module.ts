import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';

import { ClientModule } from 'app/modules/client/client.module';
import { ShareModule } from 'app/modules/share/share.module';

import { MainComponent } from './components/main/main.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { RecommendComponent } from './components/recommend/recommend.component';
import { NotifyComponent } from './components/notify/notify.component';
import { PrivacyAgreementComponent } from './components/privacy-agreement/privacy-agreement.component';
import { ProxyInterceptor } from './services/proxy-interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';

import localeZH from '@angular/common/locales/zh';
import localeEN from '@angular/common/locales/en';
import localePT from '@angular/common/locales/pt';
import localeKN from '@angular/common/locales/kn';
import localeHI from '@angular/common/locales/hi';
import localeGL from '@angular/common/locales/gl';
import localeAM from '@angular/common/locales/am';

registerLocaleData(localeZH, 'zh');
registerLocaleData(localeEN, 'en');
registerLocaleData(localePT, 'pt');
registerLocaleData(localeKN, 'kn');
registerLocaleData(localeHI, 'hi');
registerLocaleData(localeGL, 'gl');
registerLocaleData(localeAM, 'am');

@NgModule({
  declarations: [
    AppComponent,
    SideNavComponent,
    RecommendComponent,
    NotifyComponent,
    PrivacyAgreementComponent,
    MainComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    ClientModule,
    ShareModule,
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: ProxyInterceptor, multi: true }],
  bootstrap: [AppComponent],
})
export class AppModule {}
