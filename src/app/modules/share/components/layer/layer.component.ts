import { Component, Input } from '@angular/core';

@Component({
  selector: 'dstore-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss']
})
export class LayerComponent {

  constructor(
  ){}

  @Input()
  dialogTitle:string = "";

  @Input()
  both=false;

  @Input()
  main=false;

  @Input()
  outer:boolean = true;
  
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

  outer_close() {
    if(this.outer) {
      this.close();
    }
  }


}
