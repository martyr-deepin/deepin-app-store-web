import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyAppRoutingModule } from './my-apps-routing.module';
import { ShareModule } from '../share/share.module';

import { LocalAppComponent } from './components/local-app/local-app.component';
import { RemoteAppComponent } from './components/remote-app/remote-app.component';
import { RemoteInstallComponent } from './components/remote-install/remote-install.component';
import { SwitchButtonComponent } from './components/switch-button/switch-button.component';
import { BatchInstallComponent } from './components/batch-install/batch-install.component';
import { CheckboxButtonComponent } from './components/checkbox-button/checkbox-button.component';
import { RefundComponent } from './components/refund/refund.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { RefundReasonComponent } from './components/refund-reason/refund-reason.component';

@NgModule({
  declarations: [
    LocalAppComponent,
    RemoteAppComponent,
    RemoteInstallComponent,
    SwitchButtonComponent,
    BatchInstallComponent,
    CheckboxButtonComponent,
    RefundComponent,
    CheckboxComponent,
    RefundReasonComponent,
  ],
  imports: [CommonModule, MyAppRoutingModule, ShareModule],
})
export class MyAppsModule {}
