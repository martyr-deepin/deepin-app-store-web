import { Component, OnInit, TemplateRef, ContentChild, Input, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { HomeQuery } from 'app/store/home.query';
import { map } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { Subscription } from 'rxjs';
@Component({
  selector: 'm-grid-stack',
  templateUrl: './grid-stack.component.html',
  styleUrls: ['./grid-stack.component.scss'],
})
export class GridStackComponent<T extends GridType> implements OnInit, OnDestroy, AfterViewInit {
  constructor(private el: ElementRef, private homeQuery: HomeQuery) {}

  data$ = this.homeQuery.select('section').pipe(map((section) => section?.dataset));
  @Input() cellHeight: number;
  @ContentChild(TemplateRef, { static: false }) template: TemplateRef<HTMLElement>;

  data:T[] = [];

  dataSubscription: Subscription;
  ngOnInit(): void {
    this.data$.subscribe((res) => {
      this.data = cloneDeep(res);
      this.dataHandle();
    });
  }

  ngAfterViewInit(): void {
    this.setHight();
  }

  ngOnDestroy(): void {
    if(this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  maxHeight: number = 0;
  dataHandle() {
    let cols = new Array<number>(4).fill(0);
    this.data.forEach((value) => {
      let top = 0;
      let end = value.x + value.width;
      let begin = value.x;
      if (value.x > 3) {
        end = 3;
        begin = 3 - value.width;
      }
      for (let i = begin; i < end; i++) {
        if (cols[i] > top) {
          top = cols[i];
        }
      }
      for (let i = begin; i < end; i++) {
        cols[i] = top + value.height;
      }
      value.y = top;
    });
    this.maxHeight = cols.sort((a, b) => b - a)[0];
  }

  setHight() {
    const el = this.el.nativeElement.querySelector('.grid-stack');
    const sum = this.maxHeight * this.cellHeight + 'px';
    if (el) {
      el.style.height = sum;
    }
  }
}

interface GridType {
  x: number;
  y: number;
  width: number;
  height: number;
}
