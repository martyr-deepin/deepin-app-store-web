import { Component, Input, OnChanges, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { first, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import smoothScrollIntoView from 'smooth-scroll-into-view-if-needed';
import { AuthService, UserInfo } from 'app/services/auth.service';
import { CommentService, AppComment, CommentDisableStatus, CommentDisableReason } from '../../services/comment.service';
import { FormBuilder, Validators } from '@angular/forms';
import { environment } from 'environments/environment';
import { Package } from 'app/modules/client/services/store.service';

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
  animations: [
    trigger('myComment', [
      state('in', style({ transform: 'scaleY(1)', opacity: 1 })),
      transition('void => in', [
        style({
          transform: 'scaleY(0)',
          opacity: 0,
        }),
        animate(200),
      ]),
    ]),
  ],
})
export class AppCommentComponent implements  OnChanges {
  constructor(
    private authService: AuthService,
    private commentService: CommentService,
    private auth: AuthService,
    private fb: FormBuilder,
  ) {}
  readonly supportSignIn = environment.supportSignIn;
  @ViewChild('commentRef', { static: true }) commentRef: ElementRef<HTMLDivElement>;
  @Input() appID: number;
  @Input() appVersion: string;
  @Input() pkg: Package;

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
  valueSetEmpty = {
    app_id: 0,
    app_version: '',
    content: '',
    score: 0,
    submitted: null,
  };
  loading = true;
  loadCount = 0;
  info: UserInfo;
  disableStatus: CommentDisableStatus = {
    disable: true,
  };
  info$ = this.auth.info$;
  clean$ = this.info$.pipe(
    tap(() => {
      this.content.setValue('');
      this.score.setValue(0);
    }),
  );
  own: AppComment;

  CommentType = CommentType;
  CommentError = CommentError;
  haveNewComment = false;
  total: { [key: number]: number } = {};
  select = CommentType.News;
  list: AppComment[];
  page = { index: 0, size: 20 };

  login = () => this.authService.login();
  logout = () => this.authService.logout(true);
  register = () => this.authService.register();

  get publicAPI() {
    return this.commentService.publicAPI(this.appID);
  }
  get comments() {
    return this.commentService.getComments(this.appID);
  }
  get userAPI() {
    return this.commentService.userAPI();
  }
  // comment first page size
  get firstPageSize() {
    return this.total[this.select] % this.page.size;
  }
  get selectVersion() {
    if (this.select === CommentType.News) {
      return { version: this.appVersion };
    }
    return { exclude_version: this.appVersion };
  }

  ngOnChanges(c: SimpleChanges) {
    this.commentGroup.patchValue({
      app_id: this.appID,
      app_version: this.appVersion,
    });
    this.init()
  }
  async init() {
    await this.getCount();
    if (this.appVersion) {
      await this.getDisableStatus();
    } else {
      this.disableStatus = {
        disable: true,
        reason: CommentDisableReason.CommentDisableReasonUnavailable,
      };
    }
    this.selectChange(CommentType.News);
  }
  async getDisableStatus() {
    const info = await this.info$.pipe(first()).toPromise();
    if (info) {
      this.disableStatus = await this.commentService.getDisableStatus(this.appID, this.appVersion).toPromise();
    }
  }
  async getCount() {
    // get current version comment count
    {
      const resp = await this.publicAPI.list({ limit: 1, version: this.appVersion });
      this.total[CommentType.News] = resp.count;
    }
    // get history version comment count
    {
      const resp = await this.publicAPI.list({ limit: 1, exclude_version: this.appVersion });
      this.total[CommentType.History] = resp.count;
    }
  }
  async selectChange(select: CommentType) {
    this.select = select;
    await this.pageChange(0);
  }
  async pageChange(page: number) {
    if (this.page.index !== page) {
      this.commentTop();
    }
    this.page.index = page;
    await this.getComments();
  }
  async getComments() {
    if (this.total[this.select] === 0) {
      await this.getCount();
      if (this.total[this.select] === 0) {
        this.list = [];
        this.loading = false;
        return;
      }
    }
    const resp = await this.comments.list({
      limit: 20,
      offset: this.page.index * 20,
      version: this.appVersion,
      history: this.select !== CommentType.News,
    });
    this.loadCount++;
    const mark = this.loadCount;
    this.loading = true;
    if (this.page.index === 0) {
      // get hot comment
      const topResp = await this.comments.list({ top: true });
      const topIds = [];
      topResp.items.forEach((item) => {
        topIds.push(item.id);
      });
      resp.items.map((item) => {
        item.isHot = topIds.includes(item.id);
      });
      const info = await this.info$.pipe(first()).toPromise();
      if (info) {
        const userResp = await this.userAPI.list({ app_id: this.appID, ...this.selectVersion });
        if (this.appVersion !== undefined || this.appVersion !== null) {
          if (this.select === CommentType.News) {
            this.own = userResp.items[0];
          }
        } else {
          this.select = CommentType.History;
        }
        const aheadResp = resp.items.filter((c) => {
          return c.commenter === info.uid;
        });
        resp.items = resp.items.filter((c) => c.commenter !== info.uid);
        //resp.items.shift();
        if (aheadResp) {
          resp.items.unshift(...aheadResp);
        }
      }
    }
    if (this.loadCount === mark) {
      this.list = resp.items;
      this.loading = false;
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
      await this.userAPI.post(this.commentGroup.getRawValue());
      this.total[CommentType.News] = this.total[CommentType.News] + 1;
      this.haveNewComment = true;
      this.commentService.sourceCount$.next(1);
      await this.selectChange(CommentType.News);
      setTimeout(() => (this.haveNewComment = false), 1000);
      this.tags.clear();
      this.commentGroup.reset(this.valueSetEmpty);
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.commentGroup.enable();
        this.commentGroup.setErrors({ error: true });
      }
    }
  }
  async thumbUpClick(c: AppComment) {
    const info = await this.info$.pipe(first()).toPromise();
    if (!info) {
      this.login();
      return;
    }
    const by = c.likes.findIndex((like) => like.liker === info.uid);
    if (by === -1) {
      await this.commentService.like(c.id).toPromise();
      c.likes.push({ liker: info.uid });
    } else {
      await this.commentService.dislike(c.id).toPromise();
      c.likes.splice(by, 1);
    }
  }
  commentTop() {
    smoothScrollIntoView(this.commentRef.nativeElement, {
      scrollMode: 'if-needed',
      block: 'start',
    });
  }
  scrollToTop() {
    smoothScrollIntoView(document.querySelector('.appInfo'), {
      block: 'start',
    });
  }
  likeByMe(likes: { liker: number }[], uid: number) {
    return likes.find((like) => like.liker === uid);
  }

  selectTag(tag: string) {
    this.content.setValue('');
    this.tags.push(this.fb.control({ tag }));
  }
}
