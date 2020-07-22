import { Component, ElementRef, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'screen-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss']
})
export class LayerComponent implements OnInit {

  constructor(
    private el: ElementRef<HTMLDivElement>
  ) { }

  destruction:boolean = false;

  ngOnInit(): void {
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

  toggle(e:MouseEvent) {
    event.cancelBubble = true;
    if(this.destruction) {
      this.close()
    }else {
      this.show(e)
    }
  }

  show(e:MouseEvent){
    if(e) {
      const target:any = e.target;
      const pre = this.el.nativeElement;
      const pop = target.getBoundingClientRect()
      pre.style["left"] = pop.left+target.offsetWidth-pre.clientWidth+"px"
      pre.style["top"] = pop.top+target.offsetHeight+10 +"px"
    }
    this.destruction = true;
  }

}
