import { Pipe, PipeTransform } from '@angular/core';
import { Subject, of } from 'rxjs';
import { debounceTime, map, share, switchMap } from 'rxjs/operators';
import { DeepinidInfoService, DeepinInfo } from '../services/deepinid.service';

@Pipe({
  name: 'deepinid',
})
export class DeepinidPipe implements PipeTransform {
  constructor(private service: DeepinidInfoService) {}
  // private cache = new Map<number, DeepinInfo>();
  // private ids = new Set<number>();
  query$ = new Subject<void>();
  result$ = this.query$.pipe(
    debounceTime(300),
    switchMap(() => {
      const ids = [...this.service.ids.values()].filter(id => !this.service.cache.has(id));
      this.service.ids.clear();
      if (ids.length === 0) {
        return of(this.service.cache);
      }
      return this.service.getDeepinUserInfo(ids).pipe(
        map(result => {
          result.forEach(info => this.service.cache.set(info.uid, info));

          return this.service.cache;
        }),
      );
    }),
    share(),
  );
  transform(uid: number) {
    this.service.ids.add(uid);
    setTimeout(() => this.query$.next());
    return this.result$.pipe(
      map(() => {
        if (!this.service.cache.has(uid)) {
          this.service.cache.set(uid, { uid: 0 } as DeepinInfo);
        }
        return this.service.cache.get(uid);
      }),
    );
  }
}
