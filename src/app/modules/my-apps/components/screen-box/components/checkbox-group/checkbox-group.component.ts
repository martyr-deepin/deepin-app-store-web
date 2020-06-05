import { Component, forwardRef, Input } from '@angular/core';
import {  CheckboxConfig } from '../checkbox/checkbox.component';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ScreenBoxKeys } from 'app/modules/my-apps/services/local-app.service';

@Component({
  selector: 'dstore-checkbox-group',
  templateUrl: './checkbox-group.component.html',
  styleUrls: ['./checkbox-group.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DstoreCheckboxGroupComponent),
      multi: true
    }
  ]
})
export class DstoreCheckboxGroupComponent implements ControlValueAccessor {
 
  constructor() { }

  @Input()
  config:CheckboxConfig[];

  @Input()
  align:CheckboxAlignType;

  checkedList:boolean[] = []

  ScreenBoxKeys = ScreenBoxKeys;

  change = (val:any)=>{}

  writeValue(obj: any): void {
    if(obj) {
      this.checkedList = obj
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


export enum CheckboxAlignType {
  column = 'column',
  row = 'row'
}