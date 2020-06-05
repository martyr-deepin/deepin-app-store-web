import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { LocalAppService } from 'app/modules/my-apps/services/local-app.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'screen-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchBoxComponent),
      multi: true
    }
  ]
})
export class SearchBoxComponent implements ControlValueAccessor {

  constructor(
    private service: LocalAppService
  ) { }

  name:string="";

  focus:boolean=false;

  private timeout;

  keyup(name:string) {
    this.change(name)
    clearTimeout(this.timeout)
    if(name&&name.replace(/\s*/g,"")!="") {
      this.timeout = setTimeout(()=>{
        this.search(name)
      },500)
    }else {
      this.list = []
    }
  }

  list:string[] = []

  async search(name:string){
    let list:string[] = []
    const softs = await this.service.installedSofts$.pipe(first()).toPromise()
    list.push( ...softs.filter(soft=>soft.software.id != 0&&soft.software.info.name.indexOf(name)>-1).map(soft=>soft.software.info.name) )
    list.push( ...softs.filter(soft=>soft.software.id === 0&&soft.package.appName.indexOf(name)>-1).map(soft=>soft.package.appName))
    this.list = list;
  }

  itemClick(name:string) {
    this.name = name;
    this.change(name)
    let to = setTimeout(()=>{
      clearTimeout(to)
      this.list = []
    },50)
  }

  close(){
    this.list= []
  }

  blur(){
    if(!this.name||this.name === "") {
      this.focus = false;
    }
  }
  cancelBubble(){
    window.event.cancelBubble = true;
  }

  change(name:string) {

  }

  writeValue(obj: any): void {
    if(obj != null && obj != undefined) {
      this.name = obj
    }
  }
  registerOnChange(fn: any): void {
    this.change = fn;
  }

  registerOnTouched(fn: any): void {
    //throw new Error("Method not implemented.");
  }
  setDisabledState?(isDisabled: boolean): void {
    //throw new Error("Method not implemented.");
  }

}
