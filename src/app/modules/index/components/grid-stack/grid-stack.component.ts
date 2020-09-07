import { Component, OnInit, TemplateRef, ContentChild, Input, ElementRef, AfterViewInit } from '@angular/core';
@Component({
  selector: 'm-grid-stack',
  templateUrl: './grid-stack.component.html',
  styleUrls: ['./grid-stack.component.scss'],
})
export class GridStackComponent<T extends GridType> implements OnInit, AfterViewInit {
  constructor(private el: ElementRef) {}
  @Input() data: Array<T> = [];
  @Input() cellHeight: number;
  @ContentChild(TemplateRef, { static: false }) template: TemplateRef<HTMLElement>;

  ngOnInit(): void {
    this.dataHandle();
  }

  ngAfterViewInit() {
    this.setHight();
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
    el.style.height = sum;
  }
}

interface GridType {
  x: number;
  y: number;
  width: number;
  height: number;
}
