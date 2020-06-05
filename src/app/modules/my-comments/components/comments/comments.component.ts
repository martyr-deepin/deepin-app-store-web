import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, startWith, switchMap, map, share } from 'rxjs/operators';

import { CommentsService, UserComment } from '../../services/comments.service';
@Component({
  selector: 'dstore-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
})
export class CommentsComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router, private commentsService: CommentsService) {}
  editing: UserComment;
  reload$ = new BehaviorSubject<void>(null);
  // 监听列表高度
  listHeight$ = new BehaviorSubject<number>(0);
  // 根据列表高度计算列表行数
  pageSize$ = this.listHeight$.pipe(
    map(height => Math.floor(height / 60)),
    distinctUntilChanged(),
  );
  // 监听当前页
  pageIndex$ = this.route.queryParamMap.pipe(map(query => Number(query.get('page') || 1) - 1));
  // 根据列表行数和页数的变动,拉取列表数据
  result$ = combineLatest([this.pageIndex$.pipe(startWith(0)), this.pageSize$, this.reload$]).pipe(
    switchMap(([pageIndex, pageSize]) => {
      return this.commentsService.list({ offset: pageIndex * pageSize, limit: pageSize });
    }),
    share(),
  );
  // 当前页数据
  comments$ = this.result$.pipe(map(result => result.items));
  // 总页数
  count$ = combineLatest([this.pageSize$, this.result$]).pipe(
    map(([pageSize, result]) => Math.ceil(result.count / pageSize)),
  );
  gotoPage(pageIndex: number) {
    this.router.navigate([], { queryParams: { page: pageIndex + 1 } });
  }
  editClose(changed: boolean) {
    if (changed) {
      this.reload$.next();
    }
    this.editing = null;
  }
  ngOnInit() {}
}
