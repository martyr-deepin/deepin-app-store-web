import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShareModule } from '../share/share.module';
import { MyUpdatesRoutingModule } from "./my-updates-routing.module"
import { DownloadModule } from "../download/download.module"

import { MyUpdatesComponent } from "./my-updates.component"
import { RenewableComponent } from './components/renewable/renewable.component';
import { RecentlyUpdatedComponent } from './components/recently-updated/recently-updated.component';
import { ListItemComponent } from './components/list-item/list-item.component';
import { ProgressComponent } from './components/progress/progress.component';
import { RecentlyItemComponent } from './components/recently-item/recently-item.component'

@NgModule({
  declarations: [MyUpdatesComponent,RenewableComponent, RecentlyUpdatedComponent, ListItemComponent, ProgressComponent,RecentlyItemComponent],
  imports: [CommonModule,MyUpdatesRoutingModule,ShareModule,DownloadModule],
})
export class MyUpdatesModule {}