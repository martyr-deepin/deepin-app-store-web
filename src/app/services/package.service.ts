import { Injectable } from '@angular/core';
import { StoreService, Package } from 'app/modules/client/services/store.service';
import { Subject, of } from 'rxjs';
import { filter, map, first } from 'rxjs/operators';
import { JobService } from './job.service';

@Injectable({
  providedIn: 'root',
})
export class PackageService {
  constructor(private storeService: StoreService, private jobService: JobService) {
    this.start();
    this.jobService.jobList().subscribe(() => {
      this.cache.clear()
    });
  }
  private result$ = new Subject<Map<string, Package>>();
  private cache = new Map<string, Package>();
  private queryArr: string[] = [];

  async start() {
    while (true) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (this.queryArr.length === 0) {
        continue;
      }
      const arr = this.queryArr.splice(0, 40);
      const m = await this.storeService.query(arr).toPromise();
      m.forEach((pkg, name) => this.cache.set(name, pkg));
      this.result$.next(m);
    }
  }

  query(pkgId: string) {
    if (this.cache.has(pkgId)) {
      return of(this.cache.get(pkgId));
    }
    setTimeout(() => this.queryArr.push(pkgId));
    return this.result$.pipe(
      filter(m => m.has(pkgId)),
      map(m => m.get(pkgId)),
      first(),
    );
  }

  async querys(pkgIds: string[]) {
    let result = new Map<string, Package>();
    pkgIds.forEach(id => this.cache.has(id) && result.set(id, this.cache.get(id)));
    if (result.size < pkgIds.length) {
      const mm = await this.storeService.query(pkgIds.filter(id => !result.has(id))).toPromise();
      mm.forEach((pkg, name) => {
        this.cache.set(name, pkg);
        result.set(name, pkg);
      });
    }
    return result;
  }
}

