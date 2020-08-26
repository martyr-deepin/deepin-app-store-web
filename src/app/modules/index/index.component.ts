import { Component, OnInit } from '@angular/core';

import { SectionService, SectionType } from './services/section.service';
import { environment } from 'environments/environment';
import { SysFontService } from 'app/services/sys-font.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit {
  constructor(
    private sectionService: SectionService,
    private sysFontService: SysFontService
  ) {}
  SectionType = SectionType;
  sectionList$: Promise<any>; // this.sectionService.getList();
  loadedCount = 0;

  ngOnInit() {
    this.sectionList$ = this.sectionService.getList();
  }

  loaded() {
    this.loadedCount++;
  }

  cellHeight$ = this.sysFontService.fontChange$.pipe(
    map(([fontFamily, fontSize]) => fontSize * 2 + 34)
  )

  cellHeight = environment.fontSize * 2 + 34;

}
