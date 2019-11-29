import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { range } from 'lodash';
import { Observable, timer, from, animationFrameScheduler, of, interval } from 'rxjs';
import { tap, repeat, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'dp-circle',
  templateUrl: './circle.component.html',
  styleUrls: ['./circle.component.css'],
})
export class CircleComponent implements OnInit {
  constructor() {}
  private v: number = null;
  @Input() max = 1;
  @Input()
  set value(v: number) {
    this.v = v;
    this.init(this.v);
  }
  get value() {
    return this.v;
  }
  progress = 0;
  dasharray = '0 999999';
  anime$: Observable<number> = null;
  ngOnInit() {
    if (this.v === null) {
      this.init(this.v);
    }
  }
  init(v: number) {
    if (v === null) {
      interval(0, animationFrameScheduler).subscribe(() => {
        this.progress += 1;
        if (this.progress > 100) {
          this.progress = 0;
        }
        this.dasharray = `calc((100% - 10)*3.1415926*${this.progress / 100}) 999999`;
      });
      return;
    }
    v = Number(v);
    const p = Number((v / (this.max || 1)).toFixed(2)) * 100;
    const ranges = [...range(this.progress, p), p];
    this.anime$ = from(ranges, animationFrameScheduler).pipe(
      tap(n => {
        this.progress = n;
        this.dasharray = `calc((100% - 10)*3.1415926*${this.progress / 100}) 999999`;
      }),
    );
  }
}
