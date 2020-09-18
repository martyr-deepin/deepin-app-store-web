import { Component, OnInit } from '@angular/core';

import { SectionService, SectionType } from './services/section.service';
import { environment } from 'environments/environment';
import { SysFontService } from 'app/services/sys-font.service';
import { map } from 'rxjs/operators';
import { HomeStore } from 'app/store/home.store';
import { HomeQuery } from 'app/store/home.query';
import { isEqual } from 'lodash';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit {
  constructor(
    private sectionService: SectionService,
    private sysFontService: SysFontService,
    private homeStore: HomeStore,
    private homeQuery: HomeQuery,
  ) {}
  SectionType = SectionType;
  sectionList$ = this.homeQuery.select('section').pipe(
    map(res=>{
      return res;
    })
  );
  dataset$ = this.homeQuery.select(state => {
    return state.section.dataset
  });
  loadedCount = 0;

  ngOnInit() {
    this.sectionService.getList().then((section) => {
      const sectionCache = this.homeQuery.getValue().section;
      if(isEqual(section.section,sectionCache)) {
        return;
      }
      this.homeStore.update({
        section: section.section,
      });
    });
  }

  loaded() {
    this.loadedCount++;
  }

  cellHeight$ = this.sysFontService.fontChange$.pipe(map(([fontFamily, fontSize]) => fontSize * 2 + 34));

  cellHeight = environment.fontSize * 2 + 34;
}
