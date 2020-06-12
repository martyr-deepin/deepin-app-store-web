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

  fontSize:number;

  ngOnInit(): void {
    new PerfectScrollbar(this.el.nativeElement.getElementsByClassName("pre_detail")[0], {
      suppressScrollY: false,
      suppressScrollX: true,
      wheelPropagation: false,
    });
    this.fontSize = Number(getComputedStyle(document.getElementsByTagName("html")[0]).fontSize.slice(0,-2))
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

  toggle(e:MouseEvent,auto:boolean,offset?:Offset) {
    let y = this.getElementTop(<HTMLElement>e.target)
    event.cancelBubble = true;
    const display = this.el.nativeElement.style.display;
    if(display === "block") {
      this.close()
    }else {
      if(auto) {
        if(!offset){
          offset = {x:0,y:0};
        }
        offset.x += e.clientX/this.fontSize
        offset.y += y/this.fontSize+1
      }
      this.show(e,offset)
    }
  }

  show(e:MouseEvent,offset?:Offset){
    this.el.nativeElement.style.display = "block"
    if(e) {
      const pre = this.el.nativeElement
      //确定弹出的位置
      if(offset) {
        pre.style["left"] = offset.x+"rem";
        pre.style["top"] = offset.y+"rem"
      }
    }
  }

  getElementTop(element:HTMLElement){
    var actualTop = element.offsetTop;
    var current = <HTMLElement>element.offsetParent;
    while (current !== null){
      actualTop += current.offsetTop;
      current =  <HTMLElement>current.offsetParent;
    }
    return actualTop;
  }

}

interface Offset {
  x:number,
  y:number
}
