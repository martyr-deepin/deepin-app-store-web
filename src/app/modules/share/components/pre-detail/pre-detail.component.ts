import { Component, OnInit, Input,ElementRef, HostListener } from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';

@Component({
  selector: 'dstore-pre-detail',
  templateUrl: './pre-detail.component.html',
  styleUrls: ['./pre-detail.component.scss']
})
export class PreDetailComponent implements OnInit {

  constructor(
    private el: ElementRef<HTMLDivElement>
  ) { }

  @Input() detail:string;

  destruction:boolean = false;

  ngOnInit(): void {
    new PerfectScrollbar(this.el.nativeElement, {
      suppressScrollY: false,
      suppressScrollX: true,
      wheelPropagation: false,
    });
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement:any) {
    const clickedInside = this.el.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.close()
    }
  }

  close(){
    this.destruction = false;
  }

  toggle(e:MouseEvent,right?:boolean,maxWidth?:number) {
    event.cancelBubble = true;
    if(this.destruction) {
      this.close()
    }else {
      this.show(e,right,maxWidth)
    }
  }

  show(e:MouseEvent,right?:boolean,maxWidth?:number){
    if(e) {
      const pre = this.el.nativeElement
      let x = e.clientX;
      let y = e.clientY+15;
      if(maxWidth) {
        pre.style["width"] = maxWidth+"px";
      }
      //确定弹出的位置
      if(!right) {
        x = x - pre.clientWidth + 20;
      }else {
        x = x - 20
      }
      pre.style["left"] = x+"px"
      pre.style["top"] = y+"px"
    }
    this.destruction = true;
  }

}
