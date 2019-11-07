import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'm-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements OnInit {
  constructor() {}
  private _open = false;
  @Input()
  get open() {
    return this._open;
  }
  set open(v: boolean) {
    this._open = v;
  }
  ngOnInit() {}
  showModal() {
    this.open = true;
  }
}
