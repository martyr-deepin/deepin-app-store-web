import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { AppComment, CommentService } from '../../services/comment.service';
import { AuthService, UserInfo } from 'app/services/auth.service';
import smoothScrollIntoView from 'smooth-scroll-into-view-if-needed';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { environment } from 'environments/environment';

enum CommentType {
  News,
  History,
}

@Component({
  selector: 'dstore-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss'],
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
export class CommentListComponent implements OnInit {

  constructor(
    private auth: AuthService,
    private commentService: CommentService
  ) { }

  readonly supportSignIn = environment.supportSignIn;

  @Input()
  appID:number;
  @Input()
  appVersion:string;
  @Input()
  info:UserInfo;

  haveNewComment = false;

  @ViewChild('commentRef', { static: true }) commentRef: ElementRef<HTMLDivElement>;

  pageSize = 20;
  total: { [key: number]: number } = {};
  list = new Map<CommentType,AppComment[]>();
  page: { [key:number]:number} = {};
  CommentType=CommentType;
  select = CommentType.News;
  loading = false;
  commentSubscription:Subscription;
  

  get comments() {
    return this.commentService.getComments(this.appID);
  }

  get publicAPI() {
    return this.commentService.publicAPI(this.appID);
  }
  
  get userAPI() {
    return this.commentService.userAPI();
  }

  get selectVersion() {
    if (this.select === CommentType.News) {
      return { version: this.appVersion };
    }
    return { exclude_version: this.appVersion };
  }

  ngOnInit(): void {
    this.init()
  }

  async init() {
    this.select = CommentType.History;
    this.page[this.select] = 0;
    await this.queryComments()
    this.select = CommentType.News;
    this.page[this.select] = 0;
    await this.queryComments();
  }

  async selectChange(select: CommentType) {
    this.select = select;
  }

  pageChange(page:number){
    this.commentTop()
    this.page[this.select] = page;
    this.queryComments()
  }

  async queryComments(){
    let queryObj = {
      limit: 20,
      offset: this.page[this.select] * 20,
      version: this.appVersion,
      history: this.select !== CommentType.News,
    }
    this.loading = true;
    let res = await this.comments.list(queryObj);
    if(this.page[this.select] === 0) {
      res.items = await this.queryHot(res.items);
    }
    this.list.set(this.select,res.items);
    this.total[this.select] = res.count;
    this.loading = false;
  }

  async queryHot(items:AppComment[]){
    const topResp = await this.comments.list({ top: true,version:this.appVersion,history:this.select !== CommentType.News });
    items = items.filter(c=> !topResp.items.map(t=>t.id).includes(c.id))
    if(this.info) {
      let topComments = topResp.items.filter((c)=>c.commenter != this.info.uid);
      items = items.filter((c)=>c.commenter != this.info.uid);
      const userResp = await this.userAPI.list({ app_id: this.appID, ...this.selectVersion });
      userResp.items.map(c=>{
        c.commenterInfo = this.info;
        return c;
      })
      items.unshift(...topComments)
      items.unshift(...userResp.items)
    }else {
      items.unshift(...topResp.items)
    }
    return items;
  }

  thumbUpClick(c: AppComment) {
    if (!this.info) {
      this.auth.login();
      return;
    }
    const by = c.likes.findIndex((like) => like.liker === this.info.uid);
    if (by === -1) {
      this.commentService.like(c.id).toPromise();
      c.likes.push({ liker: this.info.uid });
    } else {
      this.commentService.dislike(c.id).toPromise();
      c.likes.splice(by, 1);
    }
  }

  likeByMe(likes: { liker: number }[], uid: number) {
    return likes.find((like) => like.liker === uid);
  }

  scrollToTop() {
    smoothScrollIntoView(document.querySelector('.appInfo'), {
      block: 'start',
    });
  }

  commentTop() {
    smoothScrollIntoView(this.commentRef.nativeElement, {
      scrollMode: 'if-needed',
      block: 'start',
    });
  }

}
