import { Component, OnInit, OnDestroy } from '@angular/core';
import { combineLatest, BehaviorSubject, timer, Subscription } from 'rxjs';
import { switchMap, retryWhen, scan, first, map, share, tap } from 'rxjs/operators';
import { SoftwareService } from 'app/services/software.service';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { CategoryStore } from 'app/store/category.store';
import { CategoryQuery } from 'app/store/category.query';

@Component({
  selector: 'dstore-list-outlet',
  templateUrl: './list-outlet.component.html',
  styleUrls: ['./list-outlet.component.scss'],
})
export class ListOutletComponent implements OnInit, OnDestroy {
  constructor(
    private softService: SoftwareService,
    private categoryStore: CategoryStore,
    private categoryQuery: CategoryQuery,
    private routerQuery: RouterQuery,
  ) {}
  title = '';
  auther: number;
  slogan = false;
  name$ = this.routerQuery.selectParams('name');
  // loading offset
  offset$ = new BehaviorSubject(0);
  result$ = this.routerQuery.selectParams('value').pipe(
    switchMap((value) => {
      return this.categoryQuery.select(value);
    }),
  );

  routerSubscription: Subscription;
  ngOnInit() {
    this.routerSubscription = combineLatest(this.routerQuery.selectParams(), this.routerQuery.selectQueryParams())
      .pipe(
        switchMap(([param, query]) => {
          const [routeName, routeValue] = [param.name, param.value];
          this.title = routeValue;
          this.slogan = false;
          if (routeName === 'category') {
            this.slogan = true;
            var i = setTimeout(() => {
              const el = document.querySelector<HTMLDivElement>('.navItem.active');
              if (el) {
                this.title = el.innerText.trim();
              }
              clearTimeout(i);
            });
          }
          if (routeName === 'author') {
            this.auther = parseInt(param.value);
          }
          const order = (query.order as any) || 'download';
          this.offset$ = new BehaviorSubject(0);
          //this.offset$.next(0);
          return this.offset$.pipe(
            switchMap((offset) => {
              return this.softService.list({}, { order, [routeName]: routeValue, offset, limit: 40 })
            }),
            retryWhen((errors) =>
              errors.pipe(
                tap(console.error),
                switchMap((err) => timer(1500)),
              ),
            ),
            scan((acc, value) => [...acc, ...value], []),
            map((list) => {
              if (routeName === 'ranking') {
                list = list.slice(0, 100);
              }
              this.categoryStore.update({ [routeValue]: list });
            }),
          );
        }),
        share(),
      )
      .subscribe();
  }

  load() {
    this.offset$.pipe(first()).subscribe((offset) => {
      this.offset$.next(offset + 40);
    });
  }

  ngOnDestroy(): void {
    if (this.offset$) {
      this.offset$.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
