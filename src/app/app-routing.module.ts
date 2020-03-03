import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';
import { LoginComponent } from './components/login/login.component';
import { SystemGuardService } from './services/system-guard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'index',
    pathMatch: 'full',
    canActivate: [SystemGuardService],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  // home page
  {
    path: 'index',
    loadChildren: () => import('app/modules/index/index.module').then(m => m.IndexModule),
    canActivate: [SystemGuardService],
  },
  // detail page
  {
    path: 'app/:id',
    loadChildren: () => import('app/modules/details/details.module').then(m => m.DetailsModule),
  },
  // list page
  {
    path: 'list/:name/:value',
    loadChildren: () => import('app/modules/list/list.module').then(m => m.ListModule),
  },
  // download
  {
    path: 'download',
    loadChildren: () => import('app/modules/download/download.module').then(m => m.DownloadModule),
    // canActivate: [SystemGuardService],
  },
  {
    path: 'my/apps',
    loadChildren: () => import('app/modules/my-apps/my-apps.module').then(m => m.MyAppsModule),
  },
  {
    path: 'my/comments',
    loadChildren: () => import('app/modules/my-comments/my-comments.module').then(m => m.MyCommentsModule),
    canActivate: [AuthGuardService],
  },
  {
    path: 'my/donates',
    loadChildren: () => import('app/modules/my-donates/my-donates.module').then(m => m.MyDonatesModule),
    canActivate: [AuthGuardService],
  },
  {
    path: 'error',
    loadChildren: () => import('app/modules/error-page/error-page.module').then(m => m.ErrorPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
