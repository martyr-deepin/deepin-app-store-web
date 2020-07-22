import { Component, OnInit, Input } from '@angular/core';
import { range } from 'lodash';
import { Observable, from, animationFrameScheduler } from 'rxjs';
import { tap } from 'rxjs/operators';

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
  }
  init(v: number) {
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
