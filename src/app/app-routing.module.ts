import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'index',
    pathMatch: 'full',
  },
  // home page
  {
    path: 'index',
    loadChildren: 'app/modules/index/index.module#IndexModule',
  },
  // detail page
  {
    path: 'app/:id',
    loadChildren: 'app/modules/details/details.module#DetailsModule',
  },
  // list page
  {
    path: 'list/:name/:value',
    loadChildren: 'app/modules/list/list.module#ListModule',
  },
  // download
  {
    path: 'download',
    loadChildren: 'app/modules/download/download.module#DownloadModule',
  },
  {
    path: 'my/apps',
    loadChildren: 'app/modules/my-apps/my-apps.module#MyAppsModule',
  },
  {
    path: 'my/comments',
    loadChildren: 'app/modules/my-comments/my-comments.module#MyCommentsModule',
    canActivate: [AuthGuardService],
  },
  {
    path: 'my/donates',
    loadChildren: 'app/modules/my-donates/my-donates.module#MyDonatesModule',
    canActivate: [AuthGuardService],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
