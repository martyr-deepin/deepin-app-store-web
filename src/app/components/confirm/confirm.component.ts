import { Component, OnInit, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'dstore-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit,OnDestroy {

  constructor(){}

  @Input()
  dialogTitle:String;

  @Input()
  header:boolean = false;
  
  destruction:boolean = false;
  visible:boolean = false;

  show() {
    this.destruction = true;
    let st =setTimeout(()=>{
      this.visible = true;
      clearTimeout(st)
    },50)
  }

  close() {
    this.visible = false;
    let st = setTimeout(()=>{
      this.destruction = false;
      clearTimeout(st)
    },300)
  }

  ngOnInit(){
  }

  ngOnDestroy(){
  }

}
