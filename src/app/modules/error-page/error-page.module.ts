import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ErrorPageRoutingModule } from './error-page-routing.module';

import { SystenAuthorizationComponent } from './components/systen-authorization/systen-authorization.component';

@NgModule({
  declarations: [SystenAuthorizationComponent],
  imports: [CommonModule, ErrorPageRoutingModule],
})
export class ErrorPageModule {}
