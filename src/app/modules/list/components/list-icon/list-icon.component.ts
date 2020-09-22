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
import { combineLatest, Subscription } from "rxjs";
import { environment } from 'environments/environment';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import smoothScrollIntoView from 'smooth-scroll-into-view-if-needed';

@Component({
  selector: 'dstore-list-icon',
  templateUrl: './list-icon.component.html',
  styleUrls: ['./list-icon.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListIconComponent implements OnInit, OnChanges, OnDestroy {
  constructor(private el: ElementRef<HTMLDivElement>,
    private routerQuery: RouterQuery,) {}
  @ViewChild('loadingRef', { static: true }) loadingRef: ElementRef<HTMLDivElement>;
  @Input() list: [];
  @Input() lazyload = false;
  @Input() nameColor: string;
  @Input() subtitleColor: string;
  @Input() slogan = false;
  @Output() load = new EventEmitter<void>();
  wait = false;

  limit = 40;

  // 监听是否到达底部
  intersection = new IntersectionObserver(([e]: IntersectionObserverEntry[]) => {
    if (e.isIntersecting && this.list.length % this.limit === 0) {
      this.wait = true;
      this.load.next();
      this.intersection.unobserve(this.loadingRef.nativeElement);
    }
  });

  routerSubscription: Subscription;

  ngOnInit(): void {
    this.gridGroup();
    this.routerSubscription = combineLatest(this.routerQuery.selectParams(), this.routerQuery.selectQueryParams())
    .subscribe(res=>{
      this.commentTop();
    })
  }

  commentTop() {
    smoothScrollIntoView(this.el.nativeElement.querySelector(".item-icon"), {
      scrollMode: 'if-needed',
      block: 'start',
    });
  }

  ngOnDestroy(): void {
    this.intersection.disconnect();
    if(this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  ngOnChanges(changed: SimpleChanges) {
    if (changed.list) {
      this.wait = false;
      if (changed.list.currentValue && changed.list.currentValue.length / this.limit < 1) {
        return;
      }
      if (
        changed.list.previousValue &&
        changed.list.currentValue &&
        changed.list.previousValue.length === changed.list.currentValue.length
      ) {
        return;
      }
      if (this.lazyload) {
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
