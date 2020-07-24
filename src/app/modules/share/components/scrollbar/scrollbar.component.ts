import { Component, AfterViewInit, ElementRef, Renderer2, OnDestroy, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import {debounceTime} from "rxjs/operators"

@Component({
  selector: 'dstore-scrollbar',
  templateUrl: './scrollbar.component.html',
  styleUrls: ['./scrollbar.component.scss']
})
export class ScrollbarComponent implements OnInit,AfterViewInit,OnDestroy {

  constructor(
    private el: ElementRef<HTMLDivElement>,
    private renderer: Renderer2
  ) {}

  @Input()full:Boolean=false;
  @Input()flex:Boolean=false;
  hideY = new BehaviorSubject<boolean>(false);

  hideYSubscription:Subscription;

  bar_height:number;
  scroll_box:HTMLDivElement;
  scroll_content:HTMLDListElement;
  scroll_Y:HTMLDivElement;
  scroll_bar:HTMLDivElement;

  click_y:number;

  mousemoveFunc:Function;
  mouseupFunc:Function;
  scrolling:boolean = false;

  ngOnInit(): void {
    this.hideYSubscription = this.hideY.pipe(
      debounceTime(1000)
    ).subscribe(res=>{
      if(res){
        this.scroll_Y.style.opacity = "";
        this.scrolling = false;
      }
    })
  }

  ngAfterViewInit(): void {
    const nativeElement = this.el.nativeElement;
    this.scroll_box = nativeElement.querySelector(".dstore_scroll");
    this.scroll_content = nativeElement.querySelector(".scroll_content");
    this.scroll_Y = nativeElement.querySelector(".scroll_y");
    this.scroll_bar = nativeElement.querySelector(".scroll_bar")
    this.updateBar()
  }

  updateBar(){
    let height = (this.scroll_box.clientHeight * 100 / this.scroll_box.scrollHeight);
    this.scroll_bar.style.height = height+"%";
    this.scroll_Y.style.display = this.scroll_content.clientHeight>this.scroll_box.clientHeight?"block":"none"
  }

  scroll = ($event:Event) => {
    this.scrollY($event)
  }

  scrollY(event:Event){
    const moveY = (this.scroll_box.scrollTop*100/this.scroll_box.clientHeight)
    this.scroll_bar.style.transform = "translateY("+moveY+"%)";
    this.scroll_Y.style.opacity = "1";
    if(!this.scrolling) {
      this.updateBar()
    }
    this.scrolling = true;
    this.hideY.next(true)
  }

  clickY(event:any) {
    //获得点击位置与滚动框顶部之间的距离
    let _this = this;
    let offset = Math.abs(event.target.getBoundingClientRect().top - event.clientY)
    let bar_center = _this.scroll_bar.offsetHeight / 2;
    let bar_position = (offset - bar_center) * 100 / _this.scroll_box.offsetHeight;
    let scrollTop = bar_position * _this.scroll_box.scrollHeight / 100
    _this.scroll_box.scrollTop = scrollTop;
  }

  clickBar(e){
    this.click_y = e.currentTarget.offsetHeight - (e.clientY - e.currentTarget.getBoundingClientRect().top);
    this.scroll_Y.style.width = "10px";
    this.scroll_Y.style.borderRadius = "5px";
    this.startDrag(e);
  }

  startDrag(e){
    e.stopImmediatePropagation();
    this.startListen();
    document.onselectstart = undefined;
  }
  
  startListen() {
    this.mousemoveFunc = this.renderer.listen(document,"mousemove",(event)=>{
      this.mouseMove(event);
    });
    this.mouseupFunc = this.renderer.listen(document,"mouseup",(event) => {
      this.mouseUp(event);
    })
  }

  stopListen(){
    if(this.mousemoveFunc){
      this.mousemoveFunc();
    }
  }

  mouseMove(event:any){
    let _this = this;
    const prevPage = _this.click_y;
    if(!prevPage) return;
    const offset = (this.el.nativeElement.getBoundingClientRect().top - event.clientY) * -1
    const bar_position = (_this.scroll_bar.offsetHeight - _this.click_y);
    const bar_position_Percentage = (offset - bar_position) * 100 / _this.scroll_box.offsetHeight;
    _this.scroll_box.scrollTop = bar_position_Percentage * _this.scroll_box.scrollHeight / 100;
  }

  mouseUp(e:EventTarget){
    this.stopListen()
    this.scroll_Y.style.width = "";
    this.scroll_Y.style.borderRadius = "";
    document.onselectstart = null;
  }

  moveY(event:MouseEvent){
    this.scroll_Y.style.opacity = "1";
    this.hideY.next(true)
  }

  ngOnDestroy(): void {
    if(this.mouseupFunc) {
      this.mouseupFunc()
    }
    if(this.hideYSubscription) {
      this.hideYSubscription.unsubscribe()
    }
  }

  disableEvent(){
    return false;
  }

}
