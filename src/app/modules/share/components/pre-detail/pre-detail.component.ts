import { Component, OnInit, Input,ElementRef, HostListener, OnDestroy } from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';

@Component({
  selector: 'dstore-pre-detail',
  templateUrl: './pre-detail.component.html',
  styleUrls: ['./pre-detail.component.scss']
})
export class PreDetailComponent implements OnInit,OnDestroy {

  constructor(
    private el: ElementRef<HTMLDivElement>
  ) { }

  @Input() detail:string;

  ngOnInit(): void {
    new PerfectScrollbar(this.el.nativeElement, {
      wheelPropagation: true
    });
    //插入dom到body
    document.getElementById("scrollbar").appendChild(this.el.nativeElement)
  }
  ngOnDestroy(): void {
    document.getElementById("scrollbar").removeChild(this.el.nativeElement)
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement:any) {
    const clickedInside = this.el.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.close()
    }
  }

  close(){
    this.el.nativeElement.style.display = "none"
  }

  toggle(e:MouseEvent,right?:boolean,maxWidth?:number) {
    event.cancelBubble = true;
    const display = this.el.nativeElement.style.display;
    if(display === "block") {
      this.close()
    }else {
      this.show(e,right,maxWidth)
    }
  }

  show(e:MouseEvent,right?:boolean,maxWidth?:number){
    this.el.nativeElement.style.display = "block"
    if(e) {
      const pre = this.el.nativeElement
      let x = e.clientX;
      let y = e.clientY+15;
      if(maxWidth) {
        pre.style["width"] = maxWidth+"px";
      }
      //确定弹出的位置
      if(!right) {
        x = x - pre.clientWidth - 100;
      }else {
        x = x - 20 - 100
      }
      pre.style["left"] = x+"px"
      pre.style["top"] = y+"px"
    }
    
  }

}
