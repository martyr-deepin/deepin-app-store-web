import { Component, OnInit, Input, ElementRef } from '@angular/core';

@Component({
  selector: 'dstore-scrollbar',
  templateUrl: './scrollbar.component.html',
  styleUrls: ['./scrollbar.component.scss'],
})
export class ScrollbarComponent implements OnInit {
  constructor(private scrollbarEl: ElementRef<HTMLDivElement>) {}

  @Input()full:Boolean=false;

  @Input()flex:Boolean = false;

  ngOnInit(): void {
    if(this.flex){
      this.scrollbarEl.nativeElement.classList.add("flex")
    }
  }
  
}
