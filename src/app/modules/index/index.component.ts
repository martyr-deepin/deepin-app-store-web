import { Component, OnInit } from '@angular/core';

import { SectionService, SectionType } from './services/section.service';
import { of, Observable } from 'rxjs';
import { environment } from 'environments/environment.prod';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit {
  constructor(private sectionService: SectionService) {}
  SectionType = SectionType;
  sectionList$: Promise<any>; // this.sectionService.getList();
  loadedCount = 0;

  ngOnInit() {
    this.sectionList$ = this.sectionService.getList();
  }

  loaded() {
    this.loadedCount++;
  }
}
