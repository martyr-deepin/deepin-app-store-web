import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'dstore-star',
  templateUrl: './star.component.html',
  styleUrls: ['./star.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: StarComponent,
      multi: true,
    },
  ],
})
export class StarComponent implements OnInit, ControlValueAccessor {
  @Input() rate = 0;
  @Output() rateChange = new EventEmitter<number>();
  @Input() readonly = true;

  rateHover: number;

  scoreList = new Array(10).fill(null).map((v, i) => i / 2 + 0.5);

  constructor() {}

  ngOnInit() {}

  writeValue(score: number): void {
    this.rate = score;
  }
  registerOnChange(fn: any): void {
    this.rateChange.subscribe((v: number) => {
      this.writeValue(v);
      fn(v);
    });
  }
  registerOnTouched(fn: any): void {
    this.rateChange.subscribe(fn);
  }
  setDisabledState?(isDisabled: boolean): void {
    this.readonly = isDisabled;
  }
}
