import { Component, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'm-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: CheckboxComponent,
    },
  ],
})
export class CheckboxComponent implements OnInit, ControlValueAccessor {
  constructor() {}
  id = 'm-checkbox_' + Math.random().toString();
  control = new FormControl();
  ngOnInit() {}

  writeValue(obj: any): void {
    this.control.setValue(obj);
  }
  registerOnChange(fn: any): void {
    this.control.valueChanges.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    this.control.valueChanges.subscribe(fn);
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.control.disable() : this.control.enable();
  }
}
