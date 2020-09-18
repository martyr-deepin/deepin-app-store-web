import { BrowserModule } from '@angular/platform-browser';
import { NgModule,LOCALE_ID, Inject } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { ClientModule } from 'app/modules/client/client.module';
import { ShareModule } from 'app/modules/share/share.module';

import { MainComponent } from './components/main/main.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { NotifyComponent } from './components/notify/notify.component';
import { ProxyInterceptor } from './services/proxy-interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LocalesService } from './services/locales.service';
import { RecommendedComponent } from './components/recommended/recommended.component';
import { DstoreCheckboxComponent } from "./components/checkbox/checkbox.component";
import { ConfirmComponent } from './components/confirm/confirm.component';

import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { 
  AkitaNgRouterStoreModule 
} from '@datorama/akita-ng-router-store';
import { environment } from 'environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    SideNavComponent,
    NotifyComponent,
    MainComponent,
    RecommendedComponent,
    DstoreCheckboxComponent,
    ConfirmComponent
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
    AkitaNgRouterStoreModule,
    environment.production ? [] : AkitaNgDevtools.forRoot(),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ProxyInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    @Inject(LOCALE_ID) locale_id:string,
    private localesService:LocalesService
  ){
    const locale = locale_id.split(/-|_$/)[0];
    if(locale !="en") {
      this.localesService.loadLocale(locale);
    }
  }
}