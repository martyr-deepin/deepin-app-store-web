import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SystenAuthorizationComponent } from './components/systen-authorization/systen-authorization.component';

const routes: Routes = [
  {
    path: '',
    component: SystenAuthorizationComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ErrorPageRoutingModule {}
