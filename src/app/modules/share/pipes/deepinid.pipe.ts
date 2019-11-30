import { Pipe, PipeTransform } from '@angular/core';
import { Subject, of } from 'rxjs';
import { debounceTime, timeoutWith, map, share, switchMap } from 'rxjs/operators';
import { DeepinidInfoService, DeepinInfo } from '../services/deepinid.service';

@Pipe({
  name: 'deepinid',
})
export class DeepinidPipe implements PipeTransform {
  constructor(private deepinid: DeepinidInfoService) {}
  private cache = new Map<number, DeepinInfo>();
  private ids = new Set<number>();
  query$ = new Subject<void>();
  result$ = this.query$.pipe(
    debounceTime(300),
    switchMap(() => {
      const ids = [...this.ids.values()].filter(id => !this.cache.has(id));
      this.ids.clear();
      if (ids.length === 0) {
        return of(this.cache);
      }
      return this.deepinid.getDeepinUserInfo(ids).pipe(
        map(result => {
          result.forEach(info => this.cache.set(info.uid, info));

          return this.cache;
        }),
      );
    }),
    share(),
  );
  transform(uid: number) {
    this.ids.add(uid);
    setTimeout(() => this.query$.next());
    return this.result$.pipe(
      map(() => {
        if (!this.cache.has(uid)) {
          this.cache.set(uid, { uid: 0 } as DeepinInfo);
        }
        return this.cache.get(uid);
      }),
    );
  }
}
