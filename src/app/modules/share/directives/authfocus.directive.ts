import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[mAuthfocus]',
})
export class AuthfocusDirective implements OnInit {
  constructor(private el: ElementRef<HTMLElement>) {}
  @Input() mAuthfocus = false;
  ngOnInit() {
    if (this.mAuthfocus) {
      this.el.nativeElement.focus();
    }
  }
}
