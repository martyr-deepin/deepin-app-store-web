import { Component, Input, OnChanges, ViewChild, ElementRef, SimpleChanges, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { AppComment, CommentDisableStatus, CommentDisableReason, CommentService } from '../../services/comment.service';
import { AuthService } from 'app/services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Package } from 'app/modules/client/services/store.service';
import { environment } from 'environments/environment';
import { first } from 'rxjs/operators';
import { CommentListComponent } from '../comment-list/comment-list.component';
import { HttpErrorResponse } from '@angular/common/http';
import { LayerComponent } from 'app/modules/share/components/layer/layer.component';

enum CommentType {
  News,
  History,
}
export enum CommentError {
  Unknown,
  RateInvalid,
  CommentInvalid,
  AllInvalid,
  Failed,
}

@Component({
  selector: 'dstore-app-comment',
  templateUrl: './app-comment.component.html',
  styleUrls: ['./app-comment.component.scss'],
})
export class AppCommentComponent implements OnInit, OnChanges {
  constructor(
    private auth: AuthService,
    private commentService: CommentService,
    private authService: AuthService,
    private fb: FormBuilder,
  ) {}
  readonly supportSignIn = environment.supportSignIn;
  @ViewChild('commentListRef') commentRef: CommentListComponent;
  @Input() appID: number;
  @Input() appVersion: string;
  @Input() pkg: Package;

  info$ = this.auth.info$;
  own: AppComment;
  disableStatus: CommentDisableStatus = {
    disable: true,
  };

  content = this.fb.control('', Validators.required);
  score = this.fb.control(0, Validators.min(0.5));
  submitted = this.fb.control(null);
  tags = this.fb.array([]);
  commentGroup = this.fb.group({
    app_id: [0, Validators.required],
    app_version: ['', Validators.required],
    content: this.content,
    score: this.score,
    submitted: this.submitted,
    tags: this.tags,
  });

  layer_content = this.fb.control('', Validators.required);
  layer_score = this.fb.control(0, Validators.min(0.5));
  layer_submitted = this.fb.control(null);
  layer_tags = this.fb.array([]);
  commentLayerGroup = this.fb.group({
    app_id: [0, Validators.required],
    app_version: ['', Validators.required],
    content: this.layer_content,
    score: this.layer_score,
    submitted: this.layer_submitted,
    tags: this.layer_tags,
  });

  valueSetEmpty = {
    app_id: 0,
    app_version: '',
    content: '',
    score: 0,
    submitted: null,
  };
  ngOnInit() {
    this.queryOwn();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.appVersion) {
      this.commentGroup.patchValue({
        app_id: this.appID,
        app_version: this.appVersion,
      });
      this.commentLayerGroup.patchValue({
        app_id: this.appID,
        app_version: this.appVersion
      })
    }
    if (changes.pkg) {
      this.init();
    }
  }

  async init() {
    if (this.appVersion) {
      await this.getDisableStatus();
    } else {
      this.disableStatus = {
        disable: true,
        reason: CommentDisableReason.CommentDisableReasonUnavailable,
      };
    }
  }

  get userAPI() {
    return this.commentService.userAPI();
  }

  login = () => this.authService.login();

  async getDisableStatus() {
    const info = await this.info$.pipe(first()).toPromise();
    if (info) {
      this.disableStatus = await this.commentService.getDisableStatus(this.appID, this.appVersion).toPromise();
    }
  }

  async queryOwn() {
    let info = await this.info$.pipe(first()).toPromise();
    if (info) {
      this.userAPI.list({ app_id: this.appID, version: this.appVersion }).then((res) => {
        this.own = res.items[0];
      });
    }
  }

  async submitComment() {
    const content = this.commentGroup.get('content');
    content.setValue(content.value.trim());
    this.commentGroup.markAllAsTouched();
    if (this.commentGroup.invalid) {
      return;
    }
    try {
      this.commentGroup.disable();
      this.commentRef.haveNewComment = true;
      await this.userAPI.post(this.commentGroup.getRawValue());
      this.queryOwn();
      this.commentRef.selectChange(CommentType.News);
      this.commentRef.pageChange(0);
      setTimeout(() => (this.commentRef.haveNewComment = false), 2000);
      this.tags.clear();
      this.commentGroup.reset(this.valueSetEmpty);
      this.commentService.sourceCount$.next(1);
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.commentGroup.enable();
        this.commentGroup.setErrors({ error: true });
      }
    }
  }

  async bugSubmit(layer:LayerComponent) {
    this.layer_tags.push(this.fb.control({ tag: 'bug' }));
    this.commentLayerGroup.markAllAsTouched();
    if (this.commentLayerGroup.invalid) {
      return;
    }
    try {
      this.commentLayerGroup.disable();
      this.commentRef.haveNewComment = true;
      await this.userAPI.post(this.commentLayerGroup.getRawValue());
      layer.close();
      this.queryOwn();
      this.commentRef.selectChange(CommentType.News);
      this.commentRef.pageChange(0);
      setTimeout(() => (this.commentRef.haveNewComment = false), 2000);
      this.layer_tags.clear();
      this.commentLayerGroup.reset(this.valueSetEmpty);
      this.commentService.sourceCount$.next(1);
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.commentLayerGroup.enable();
        this.commentLayerGroup.setErrors({ error: true });
      }
    }
  }

  reset() {
    this.commentLayerGroup.get('content').setValue("");
    this.commentLayerGroup.get("score").setValue(0);
  }

}
