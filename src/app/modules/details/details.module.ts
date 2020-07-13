import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DetailsRoutingModule } from './details-routing.module';
import { ShareModule } from 'app/modules/share/share.module';

import { AppDetailComponent } from './app-detail.component';
import { DonorsComponent } from './components/donors/donors.component';
import { ScreenshotComponent } from './components/screenshot/screenshot.component';
import { AppCommentComponent } from './components/comment/app-comment.component';
import { CommentDisableReasonTextComponent } from './components/comment-disable-reason-text/comment-disable-reason-text.component';

@NgModule({
  declarations: [
    AppDetailComponent,
    DonorsComponent,
    ScreenshotComponent,
    AppCommentComponent,
    CommentDisableReasonTextComponent,
  ],
  imports: [CommonModule, DetailsRoutingModule, ShareModule, FormsModule, ReactiveFormsModule],
})
export class DetailsModule {}
