import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ClientModule } from 'app/modules/client/client.module';

import { DialogDirective } from './directives/dialog.directive';
import { HoverDirective } from './directives/hover.directive';
import { ResizeDirective } from './directives/resize.directive';
import { CoverDirective } from './directives/cover.directive';
import { CircleDirective } from './directives/circle.directive';
import { AuthfocusDirective } from './directives/authfocus.directive';
import { TipsDirective } from "./directives/tips.directive";
import { JqueryToolTip } from "./directives/jquery-tooltip.directive"

import { WaitComponent } from './components/wait/wait.component';
import { ScrollbarComponent } from './components/scrollbar/scrollbar.component';
import { AppTitleComponent } from './components/app-title/app-title.component';
import { CenterTitleComponent } from './components/center-title/center-title.component';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { CloseButtonComponent } from './components/close-button/close-button.component';
import { ControlComponent } from './components/control/control.component';
import { StarComponent } from './components/star/star.component';
import { IndicationComponent } from './components/indication/indication.component';
import { LayerComponent } from './components/layer/layer.component'
import { PreDetailComponent } from './components/pre-detail/pre-detail.component';
import { CircleComponent } from './components/circle/circle.component';
import { ListCategory } from './components/category/category.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { BuyComponent } from './components/buy/buy.component';
import { WaitIconComponent } from './components/wait-icon/wait-icon.component';

import { RangePipe } from './pipes/range.pipe';
import { FitImage } from './pipes/fit-image';
import { FitLanguage } from './pipes/fit-lang';
import { SizeHuman } from './pipes/size-human';
import { DeepinidPipe } from './pipes/deepinid.pipe';
import { CategoryTextPipe } from './pipes/category-text.pipe';
import { AppScorePipe } from './pipes/app-score.pipe'
import { CoverImagePipe } from './pipes/cover-image.pipe'

const components = [
  WaitComponent,
  WaitIconComponent,
  ScrollbarComponent,
  AppTitleComponent,
  PaginatorComponent,
  CenterTitleComponent,
  CloseButtonComponent,
  ControlComponent,
  StarComponent,
  IndicationComponent,
  LayerComponent,
  DialogComponent,
  BuyComponent,
  CircleComponent,ListCategory,
  PreDetailComponent
];
const directives = [DialogDirective, HoverDirective, ResizeDirective, CoverDirective, AuthfocusDirective,CircleDirective,TipsDirective,JqueryToolTip];
const pipes = [RangePipe, FitImage, FitLanguage, SizeHuman, DeepinidPipe, CategoryTextPipe, AppScorePipe,CoverImagePipe];
const modules = [ClientModule, FormsModule, ReactiveFormsModule];
@NgModule({
  declarations: [...components, ...directives, ...pipes],
  exports: [...components, ...directives, ...pipes, ...modules],
  imports: [CommonModule, RouterModule, ...modules],
})
export class ShareModule {}
