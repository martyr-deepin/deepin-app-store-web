import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'dstore-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DstoreCheckboxComponent),
      multi: true
    }
  ]
})
export class DstoreCheckboxComponent implements ControlValueAccessor {

  constructor() { }

  @Input()
  config: CheckboxConfig;
  
  checked:boolean
  
  //初始化一个空方法，不需要任何实现
  change = (value: any) => {
  };

  writeValue(obj: any): void {
    if(obj != null && obj != undefined) {
      this.checked = obj
      //this.change(this.checked);
    }
  }
  registerOnChange(fn: any): void {
    //将接口传过来的方法赋予change，用于实现 model=>view
    this.change = fn;
  }
  registerOnTouched(fn: any): void {
  }
  setDisabledState?(isDisabled: boolean): void {
    
  }
}

export enum CheckboxType {
  primary = 'primary',
  success = 'success',
  warning = 'warning',
  info = 'info',
  danger = 'danger'
}

export interface CheckboxConfig {
  label:any,
  value:any,
  type?:CheckboxType,
  circle?: boolean,
  disabled?: boolean,
  mixed?:boolean,
  data1?:any //预留字段
}