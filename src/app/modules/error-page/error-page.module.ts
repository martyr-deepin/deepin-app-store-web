import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ErrorPageRoutingModule } from './error-page-routing.module';
import { IndexComponent } from './components/index/index.component';
import { SystenAuthorizationComponent } from './components/systen-authorization/systen-authorization.component';


@NgModule({
  declarations: [IndexComponent, SystenAuthorizationComponent],
  imports: [
    CommonModule,
    ErrorPageRoutingModule
  ]
})
export class ErrorPageModule { }
