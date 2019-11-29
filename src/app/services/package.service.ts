import { Injectable } from '@angular/core';
import { StoreService } from 'app/modules/client/services/store.service';
import { Subject } from 'rxjs';
import { filter, share, map, buffer, switchMap, first, debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PackageService {
  constructor(private storeService: StoreService) {}

  private q$ = new Subject<QueryOption>();
  private r$ = this.q$.pipe(
    buffer(this.q$.pipe(debounceTime(100))),
    switchMap(opts => {
      return this.storeService.query(opts);
    }),
    share(),
  );
  query(opt: QueryOption) {
    setTimeout(() => this.q$.next(opt));
    return this.r$.pipe(
      filter(m => m.has(opt.name)),
      map(m => m.get(opt.name)),
      first(),
    );
  }

  async querys(opts: QueryOption[]) {
    return this.storeService.query(opts).toPromise();
  }
}

interface QueryOption {
  name: string;
  localName: string;
  packages: { packageURI: string }[];
}
