import { Component, OnInit, TemplateRef, ContentChild, Input, ElementRef, Output, EventEmitter, AfterViewInit } from '@angular/core';
@Component({
  selector: 'm-grid-stack',
  templateUrl: './grid-stack.component.html',
  styleUrls: ['./grid-stack.component.scss']
})
export class GridStackComponent<T extends GridType> implements OnInit,AfterViewInit {
  constructor(private el: ElementRef) {}
  @Input() data: Array<T> = [];
  @Input() cellHeight:number;
  @ContentChild(TemplateRef, { static: false }) template: TemplateRef<HTMLElement>;

  rowHeight=60;
  ngOnInit(): void {
    this.dataHandle();
  }

  ngAfterViewInit() {
    this.setHight();
  }
  maxHeight:number = 0;
  dataHandle() {
    let cols = new Array<number>(4).fill(0)
    let top = 0;
    this.data.forEach((value) => {
      for(let i=value.x;i<(value.x+value.width);i++) {
        if(cols[i]>top) {
          top = cols[i]
        }
        cols[i] += value.height;
      }
      value.y = top;
      //value['y'] = y;
    });
    this.maxHeight = cols.sort((a,b)=>b-a)[0]
  }

  setHight(){
    const el = this.el.nativeElement.querySelector('.grid-stack')
    const sum = this.maxHeight*60+"px";
    el.style.height = sum;
  }
}

interface GridType {
  x: number;
  y: number;
  width: number;
  height: number;
}
