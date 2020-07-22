import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Subscription } from 'rxjs';

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
export class StarComponent implements OnInit,OnDestroy, ControlValueAccessor {
  @Input() rate = 0;
  @Output() rateChange = new EventEmitter<number>();
  @Input() readonly = true;

  rateHover: number;

  scoreList = new Array(10).fill(null).map((v, i) => i / 2 + 0.5);

  constructor() {}

  ngOnInit() {}

  writeValue(score: number): void {
    if (score === null) {
      this.rate = 0;
      return;
    }
    this.rate = score;
  }
  registerSubscription:Subscription;
  registerOnChange(fn: any): void {
    this.registerSubscription = this.rateChange.subscribe((v: number) => {
      this.writeValue(v);
      fn(v);
    });
  }
  registerOnTouched(fn: any): void {
    //this.rateChange.pipe(tag('star')).subscribe(fn);
  }
  setDisabledState?(isDisabled: boolean): void {
    this.readonly = isDisabled;
  }
  ngOnDestroy(): void {
    if(this.registerSubscription) {
      this.registerSubscription.unsubscribe()
    }
  }
}
