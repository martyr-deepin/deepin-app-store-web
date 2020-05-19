import {
  Component,
  OnInit,
  Input,
  ElementRef,
  OnChanges,
  SimpleChanges,
  ViewChild,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import { WaitIconComponent } from 'app/modules/share/components/wait-icon/wait-icon.component';
@Component({
  selector: 'dstore-list-icon',
  templateUrl: './list-icon.component.html',
  styleUrls: ['./list-icon.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListIconComponent implements OnInit, OnChanges {
  constructor() {}
  @ViewChild('loadingRef', { static: true }) elRef: ElementRef<HTMLDivElement>;
  @ViewChild('waitIcon', { static: true }) waitIcon: WaitIconComponent;
  @Input() list: [];
  @Input() lazyload = false;
  @Input() nameColor: string;
  @Input() subtitleColor: string;
  @Input() slogan = false;
  @Output() load = new EventEmitter<void>();
  wait = false;

  // 监听是否到达底部
  intersection = new IntersectionObserver(([e]: IntersectionObserverEntry[]) => {
    if (e.isIntersecting) {
      this.wait = true;
      this.load.next();
      this.intersection.unobserve(this.elRef.nativeElement);
    }
  });

  ngOnInit(): void {}

  ngOnChanges(changed: SimpleChanges) {
    if (changed.list) {
      this.wait = false;
      if (changed.list.currentValue && changed.list.currentValue.length / 40 < 1) {
        console.log('loaded', '少于40个');
        return;
      }
      if (
        changed.list.previousValue &&
        changed.list.currentValue &&
        changed.list.previousValue.length === changed.list.currentValue.length
      ) {
        console.log('loaded');
        return;
      }
      if (this.lazyload) {
        console.log('loading');
        setTimeout(() => this.intersection.observe(this.elRef.nativeElement), 500);
      }
    }
  }
}
