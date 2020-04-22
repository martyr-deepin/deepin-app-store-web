import { Injectable } from '@angular/core';
import { StoreService, Package } from 'app/modules/client/services/store.service';
import { Subject, of } from 'rxjs';
import { filter, share, map, buffer, switchMap, first, debounceTime } from 'rxjs/operators';
import { JobService } from './job.service';

@Injectable({
  providedIn: 'root',
})
export class PackageService {
  constructor(private storeService: StoreService, private jobService: JobService) {
    this.start();
    this.jobService.jobList().subscribe(() => this.cache.clear());
  }
  private result$ = new Subject<Map<string, Package>>();
  private cache = new Map<string, Package>();
  private queryArr: QueryOption[] = [];

  async start() {
    while (true) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (this.queryArr.length === 0) {
        continue;
      }
      const arr = this.queryArr.splice(0, 20);
      const m = await this.storeService.query(arr).toPromise();
      m.forEach((pkg, name) => this.cache.set(name, pkg));
      this.result$.next(m);
    }
  }

  query(opt: QueryOption) {
    if (this.cache.has(opt.name)) {
      return of(this.cache.get(opt.name));
    }
    setTimeout(() => this.queryArr.push(opt));
    return this.result$.pipe(
      filter(m => m.has(opt.name)),
      map(m => m.get(opt.name)),
      first(),
    );
  }

  async querys(opts: QueryOption[]) {
    let result = new Map<string, Package>();
    opts.forEach(opt => this.cache.has(opt.name) && result.set(opt.name, this.cache.get(opt.name)));
    if (result.size < opts.length) {
      const mm = await this.storeService.query(opts.filter(opt => !result.has(opt.name))).toPromise();
      mm.forEach((pkg, name) => {
        this.cache.set(name, pkg);
        result.set(name, pkg);
      });
    }
    return result;
  }
}

interface QueryOption {
  name: string;
  localName: string;
  packages: { packageURI: string }[];
}
