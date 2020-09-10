import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, BehaviorSubject, timer } from 'rxjs';
import { switchMap, retryWhen, scan, first, map, share, tap } from 'rxjs/operators';
import { SoftwareService } from 'app/services/software.service';

@Component({
  selector: 'dstore-list-outlet',
  templateUrl: './list-outlet.component.html',
  styleUrls: ['./list-outlet.component.scss'],
})
export class ListOutletComponent implements OnInit,OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private softService: SoftwareService,
  ) {}
  title = '';
  auther: number;
  slogan = false;
  name$ = this.route.paramMap.pipe(map(param => param.get('name')));
  loading = false;
  // loading offset
  offset$ = new BehaviorSubject(0);
  result$ = combineLatest(this.route.paramMap, this.route.queryParamMap).pipe(
    tap(() => (this.loading = true)),
    switchMap(([param, query]) => {
      const [routeName, routeValue] = [param.get('name'), param.get('value')];
      this.title = routeValue;
      this.slogan = false;
      if (routeName === 'category') {
        this.slogan = true;
        var i = setTimeout(() => {
          const el = document.querySelector<HTMLDivElement>('.navItem.active');
          if (el) {
            this.title = el.innerText.trim();
          }
          clearTimeout(i)
        });
      }
      if (routeName === 'author') {
        this.auther = parseInt(param.get('value'));
      }
      const order = (query.get('order') as any) || 'download';

      this.offset$ = new BehaviorSubject(0);
      this.offset$.next(0)
      return this.offset$.pipe(
        switchMap(offset => this.softService.list({}, { order, [routeName]: routeValue, offset, limit: 40 })),
        retryWhen(errors =>
          errors.pipe(
            tap(console.error),
            switchMap(err => timer(1500)),
          ),
        ),
        scan((acc, value) => [...acc, ...value], []),
        map(list => {
          if (routeName === 'ranking') {
            return list.slice(0, 100);
          }
          return list;
        }),
      );
    }),
    tap(() => (this.loading = false)),
    share(),
  );

  ngOnInit() {}

  load() {
    this.offset$.pipe(first()).subscribe(offset => {
      this.offset$.next(offset + 40);
    });
  }
  ngOnDestroy(): void {
    if(this.offset$) {
      this.offset$.unsubscribe()
    }
  }
}
