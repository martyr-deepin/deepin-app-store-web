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
  OnDestroy,
} from '@angular/core';
import { environment } from 'environments/environment';
import { Subscription, fromEvent, BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
@Component({
  selector: 'dstore-list-icon',
  templateUrl: './list-icon.component.html',
  styleUrls: ['./list-icon.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListIconComponent implements OnInit, OnChanges, OnDestroy {
  constructor(private el: ElementRef<HTMLDivElement>) {}
  @ViewChild('loadingRef', { static: true }) loadingRef: ElementRef<HTMLDivElement>;
  @Input() list: [];
  @Input() lazyload = false;
  @Input() nameColor: string;
  @Input() subtitleColor: string;
  @Input() slogan = false;
  @Output() load = new EventEmitter<void>();
  wait = false;
  reloadColumn$ = new BehaviorSubject<boolean>(false);

  // 监听是否到达底部
  intersection = new IntersectionObserver(([e]: IntersectionObserverEntry[]) => {
    if (e.isIntersecting) {
      this.wait = true;
      this.load.next();
      this.intersection.unobserve(this.loadingRef.nativeElement);
    }
  });

  onResizeSubscription = fromEvent(window, 'resize').subscribe((event) => {
    this.reloadColumn$.next(true);
  });

  reloadSubscription = this.reloadColumn$.pipe(debounceTime(100)).subscribe(() => {
    this.gridGroup();
  });

  ngOnInit(): void {
    //this.gridGroup();
  }

  ngOnDestroy(): void {
    this.intersection.disconnect();
    this.onResizeSubscription.unsubscribe();
    this.reloadSubscription.unsubscribe();
  }

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
        var i = setTimeout(() => {
          this.intersection.observe(this.loadingRef.nativeElement);
          clearTimeout(i);
        }, 500);
      }
    }
  }

  //auto grid col
  gridGroup() {
    const itemIcon = <HTMLDivElement>this.el.nativeElement.querySelector('.item-icon');
    const colNum = Math.floor(itemIcon.clientWidth / (environment.fontSize * 19));
    let itemWidth = '';
    for (let i = 0; i < colNum; i++) {
      itemWidth += ' 1fr';
    }
    itemIcon.style.gridTemplateColumns = itemWidth;
  }
}
