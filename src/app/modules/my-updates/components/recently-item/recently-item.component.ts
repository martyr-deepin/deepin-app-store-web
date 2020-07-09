import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Software } from 'app/services/software.service';

@Component({
  selector: 'my-updates-recently-item',
  templateUrl: './recently-item.component.html',
  styleUrls: ['./recently-item.component.scss']
})
export class RecentlyItemComponent implements OnInit {

  constructor(
    private el: ElementRef
  ){}

  @Input() software:Software;

  ngOnInit(): void {
  }
  
  //判断是否溢出
  judgeOverflow$ = new Promise((resove)=>{
    var timeout = setTimeout(()=>{
      clearTimeout(timeout)
      resove(this.judge_overflow())
    })
  })

  judge_overflow() {
    const nativeElement = this.el.nativeElement
    const log_content = nativeElement.querySelector('.log_content')
    return log_content.scrollHeight > log_content.clientHeight || false;
  }

}
