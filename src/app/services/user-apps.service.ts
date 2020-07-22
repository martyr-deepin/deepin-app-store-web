import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { merge } from 'rxjs';
import { switchMap, shareReplay, map, startWith, debounceTime } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { BuyService } from './buy.service';
import { MessageService, MessageType } from './message.service';

@Injectable({
  providedIn: 'root',
})
export class UserAppsService {
  constructor(
    private http: HttpClient,
    private buyService: BuyService,
    private messageService: MessageService,
    private authService: AuthService,
  ) {}
  userAllApp$ = this.authService.info$.pipe(
    switchMap(info =>
      merge(this.buyService.buy$, this.messageService.onMessage(MessageType.AppsChange)).pipe(
        startWith(null),
        debounceTime(100),
        map(() => {
          return info
        }),
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
