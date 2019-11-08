import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Channel } from 'app/modules/client/utils/channel';
@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(private zone: NgZone) {}
  openApp$ = Channel.connect<string>('search.openApp');
  openSearchResult$ = Channel.connect<string>('search.openSearchResult');
  requestComplement$ = Channel.connect<string>('search.requestComplement');

  setComplementList(list: { name: string; localName: string }[]) {
    Channel.exec('search.setComplementList', list);
  }
}

export interface SearchResult {
  keyword: string;
  appNameList: string[];
}
