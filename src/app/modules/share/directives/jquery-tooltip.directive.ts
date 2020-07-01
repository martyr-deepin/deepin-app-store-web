import { Directive, ElementRef, AfterViewInit } from '@angular/core';


@Directive({
  selector: '[jqueryToolTip]',
})
export class JqueryToolTip implements AfterViewInit {

  constructor(private elRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    let dom = this.elRef.nativeElement;
    ($(dom) as any).tooltip()
  }
}