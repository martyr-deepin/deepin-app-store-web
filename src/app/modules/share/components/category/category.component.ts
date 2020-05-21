import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'm-category-name',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class ListCategory implements OnInit {
  constructor() {}
  @Input() category: string;
  ngOnInit() {}
}
