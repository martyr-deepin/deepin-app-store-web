import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, shareReplay, map, startWith } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { BuyService } from './buy.service';

@Injectable({
  providedIn: 'root',
})
export class UserAppsService {
  constructor(private http: HttpClient, private buyService: BuyService, private authService: AuthService) {
    this.userAllApp$.subscribe(v => console.log({ v }));
  }
  userAllApp$ = this.authService.info$.pipe(
    switchMap(info =>
      this.buyService.buy$.pipe(
        startWith(null),
        map(() => info),
      ),
    ),
    switchMap(async info => {
      console.log(info);
      if (info) {
        return this.getUserAllApp();
      }
      return [];
    }),
    shareReplay(1),
  );
  // Get the id of user apps
  private getUserAllApp() {
    return this.http.get<number[]>('/api/user/app_all').toPromise();
  }
}
