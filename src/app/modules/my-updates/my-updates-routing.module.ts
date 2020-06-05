import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyUpdatesComponent } from "./my-updates.component"
import { RenewableComponent } from "./components/renewable/renewable.component";
import { RecentlyUpdatedComponent } from "./components/recently-updated/recently-updated.component"

const routes: Routes = [
  {
    path: '',
    redirectTo: 'my/updates',
  },
  {
    path: 'my/updates',
    component: MyUpdatesComponent,
    children: [
      {
        path: '',
        redirectTo: 'renewable'
      },
      {
        path: 'renewable',
        component: RenewableComponent,
      },
      {
        path: 'recently/updated',
        component: RecentlyUpdatedComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyUpdatesRoutingModule {}
