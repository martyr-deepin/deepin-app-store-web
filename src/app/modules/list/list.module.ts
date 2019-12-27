import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { ListRoutingModule } from './list-routing.module';
import { ListOutletComponent } from './components/list-outlet/list-outlet.component';
import { ListComponent } from './components/list/list.component';
import { ShareModule } from '../share/share.module';

@NgModule({
  declarations: [ListOutletComponent, ListComponent],
  exports: [ListComponent],
  imports: [CommonModule, ListRoutingModule, ScrollingModule, ShareModule],
})
export class ListModule {}
