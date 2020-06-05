import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[dstoreHover]',
  exportAs: 'dstoreHover',
})
export class HoverDirective {
  hover = false;
  constructor() {}
  @HostListener('mouseover') mouseover() {
    this.hover = true;
  }
  @HostListener('mouseout') mouseout() {
    this.hover = false;
    console.log('out');
  }
}
