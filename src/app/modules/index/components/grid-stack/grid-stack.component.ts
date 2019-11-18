import { Component, OnInit, TemplateRef, ContentChild, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import 'gridstack';
@Component({
  selector: 'm-grid-stack',
  templateUrl: './grid-stack.component.html',
  styleUrls: ['./grid-stack.component.scss'],
})
export class GridStackComponent<T extends GridType> implements OnInit {
  constructor(private el: ElementRef) {}
  @Input() data: Array<T> = [];
  @Input() cellHeight = 60;
  @Input() resize = false;
  @Input() drag = true;
  @Output() change = new EventEmitter<ChangeEvent>(true);
  @ContentChild(TemplateRef, { static: false }) template: TemplateRef<HTMLElement>;
  grid: GridStack;
  ngOnInit() {
    setTimeout(() => {
      const grid = $(this.el.nativeElement.querySelector('.grid-stack')) as any;
      grid.gridstack({
        float: false,
        width: 4,
        cellHeight: this.cellHeight,
        animate: true,
        disableResize: !this.resize,
        disableDrag: !this.drag,
      });
      this.grid = grid.data('gridstack');
      {
        // fix Bug: https://github.com/gridstack/gridstack.js/issues/937
        (this.grid as any)._initStyles = () => {};
      }
      grid.on('change', (_, items) => this.itemsChange(items));
    });
  }
  itemsChange(items: { id: string; x: number; y: number; width: number; height: number }[]) {
    for (const item of items) {
      this.change.emit({
        index: Number(item.id),
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
      });
    }
  }
  trackBy(index: number) {
    return index;
  }
}

interface GridType {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ChangeEvent {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}
