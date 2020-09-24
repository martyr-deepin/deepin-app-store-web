import { Input, Output, EventEmitter } from '@angular/core';
import { Software } from 'app/services/software.service';
import { environment } from 'environments/environment';
import { Section } from '../services/section.service';
import { DatasetStore } from 'app/store/dataset.store';
import { DatasetQuery } from 'app/store/dataset.query';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { isEqual } from 'lodash';

export class SectionItemBase {
  @Input() section: Section;
  @Input() index: number;
  @Output() loaded = new EventEmitter<boolean>();
  constructor(protected datasetStore: DatasetStore, protected datasetQuery: DatasetQuery) {
  }

  softs$ = this.datasetQuery.select(this.index).pipe(
    map(res => {
      return res[this.index];
    }),
    distinctUntilChanged(),
  );

  setSofts(softs: Software[]) {
    if(isEqual(softs,this.datasetQuery.getValue()[this.index])) {
      return;
    }
    this.datasetStore.update({[this.index]:softs});
  }

  sortByLocal(zhValue = '', enValue = '') {
    if (environment.locale === 'zh_CN') {
      return -1;
    }
    return 1;
  }
}
