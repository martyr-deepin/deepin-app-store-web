import {
  Component,
  AfterViewInit,
  ElementRef,
  Renderer2,
  OnDestroy,
  Input,
  OnInit,
  HostListener,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { BehaviorSubject, Subscription, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { mutationOption, isMac, mouseMove, mouseUp, clickY, scrollY } from './scrollbar.function';
@Component({
  selector: 'dstore-scrollbar',
  templateUrl: './scrollbar.component.html',
  styleUrls: ['./scrollbar.component.scss'],
})
export class ScrollbarComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(private el: ElementRef<HTMLDivElement>, private renderer: Renderer2) {}

  @Input() full: Boolean = false;
  @Input() flex: Boolean = false;
  @Output() onReload = new EventEmitter<void>();
  @Output() intersecting = new EventEmitter<boolean>();
  hideY$ = new BehaviorSubject<boolean>(false);
  reloadBar$ = new BehaviorSubject<boolean>(false);
  mutationObserver: MutationObserver;

  hideYSubscription: Subscription;
  reloadBarSubscription: Subscription;
  onResizeSubscription: Subscription;

  @ViewChild('scrollBoxRef', { static: true })
  scrollRef: ElementRef<HTMLDivElement>;

  $scroll_box: HTMLDivElement;
  $scroll_content: HTMLDivElement;
  $scroll_Y: HTMLDivElement;
  $scroll_bar: HTMLDivElement;

  click_y: number;
  bottom: boolean = false;

  hash: number = Math.random();

  mousemoveFunc: Function;
  mouseupFunc: Function;
  isMac = isMac;

  ngOnInit(): void {
    if (!isMac()) {
      this.hideYSubscription = this.hideY$.pipe(debounceTime(1000)).subscribe((res) => {
        if (res) {
          this.$scroll_Y.style.opacity = '';
        }
      });
      this.reloadBarSubscription = this.reloadBar$.pipe(debounceTime(150)).subscribe((res) => {
        this.updateBar();
        this.onReload.emit(null);
      });
    }
  }

  ngAfterViewInit(): void {
    if (!isMac()) {
      const nativeElement = this.scrollRef.nativeElement;
      if (this.flex) {
        this.el.nativeElement.classList.add('flex');
      }
      this.$scroll_box = nativeElement;
      this.$scroll_content = <HTMLDivElement>nativeElement.firstChild;
      this.$scroll_Y = <HTMLDivElement>nativeElement.lastChild;
      this.$scroll_bar = <HTMLDivElement>nativeElement.lastChild.firstChild;
      this.addResizeListener();
      this.onWindowResize();
    }
  }

  intersection() {
    let _this = this;
    return new Promise((resove) => {
      if (_this.$scroll_box.clientHeight + _this.$scroll_box.scrollTop + 10 > _this.$scroll_content.scrollHeight
        && !_this.bottom
        ) {
        _this.bottom = true;
        _this.intersecting.next(true)
      }
      resove();
    });
  }

  @HostListener('mouseenter')
  onMouseMove() {
    this.updateBar();
  }

  scroll = ($event: MouseEvent) => {
    scrollY($event, this);
    this.intersection().then();
  };

  updateBar() {
    let height = (this.$scroll_box.clientHeight * 100) / this.$scroll_box.scrollHeight;
    this.$scroll_bar.style.height = height + '%';
    this.$scroll_Y.style.display = this.$scroll_box.scrollHeight > this.$scroll_box.clientHeight ? 'block' : 'none';
  }

  clickY(event: any) {
    clickY(event, this);
  }

  clickBar(e) {
    this.click_y = e.currentTarget.offsetHeight - (e.clientY - e.currentTarget.getBoundingClientRect().top);
    this.$scroll_Y.style.width = '10px';
    this.$scroll_Y.style.borderRadius = '5px';
    this.startDrag(e);
  }

  startDrag(e) {
    e.stopImmediatePropagation();
    this.startListen();
    document.onselectstart = undefined;
  }

  startListen() {
    this.mousemoveFunc = this.renderer.listen(document, 'mousemove', (event) => {
      this.mouseMove(event);
    });
    this.mouseupFunc = this.renderer.listen(document, 'mouseup', (event) => {
      this.mouseUp(event);
    });
  }

  stopListen() {
    if (this.mousemoveFunc) {
      this.mousemoveFunc();
    }
  }

  mouseMove(event: any) {
    mouseMove(event, this);
  }

  mouseUp(e: EventTarget) {
    this.stopListen();
    mouseUp(this);
  }

  moveY(event: MouseEvent) {
    this.$scroll_Y.style.opacity = '1';
    this.hideY$.next(true);
  }

  onWindowResize() {
    this.onResizeSubscription = fromEvent(window, 'resize').subscribe((event) => {
      this.reloadBar$.next(true);
    });
  }

  addResizeListener() {
    this.mutationObserver = new MutationObserver((mutations, observer) => {
      this.reloadBar$.next(true);
      this.bottom = false;
    });
    this.mutationObserver.observe(this.$scroll_box, mutationOption);
  }

  ngOnDestroy(): void {
    if (this.mouseupFunc) {
      this.mouseupFunc();
    }
    if (this.hideYSubscription) {
      this.hideYSubscription.unsubscribe();
    }
    if (this.onResizeSubscription) {
      this.onResizeSubscription.unsubscribe();
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  disableEvent() {
    return false;
  }
}
