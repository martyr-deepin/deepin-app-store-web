import { Injectable } from '@angular/core';
import { Subject, Observable, empty } from 'rxjs';
import { filter, map, switchMap, share } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private authService: AuthService) {
    this.onMessage().subscribe();
  }
  message = this.authService.info$.pipe(
    switchMap(info => {
      console.log('message', { info });
      if (info) {
        return this.sseMessage();
      }
      return empty();
    }),
    share(),
  );
  private Authorization() {
    return 'Bearer ' + localStorage.getItem('token');
  }
  private sseMessage() {
    return new Observable<Message>(obs => {
      try {
        const es = new EventSource(
          `${environment.server}/api/user/message_stream?Authorization=${this.Authorization()}`,
        );
        es.addEventListener('error', err => {
          obs.error(err);
        });
        es.addEventListener('message', e => {
          obs.next(JSON.parse(e.data));
        });
        return () => es.close();
      } catch (err) {
        obs.error(err);
      }
    });
  }
  private wsMessage() {
    return new Observable<Message>(obs => {
      try {
        const ws = new WebSocket(
          `ws://${new URL(environment.server).host}/api/user/message_stream?Authorization=${this.Authorization()}`,
        );
        ws.addEventListener('error', err => {
          obs.error(err);
        });
        ws.addEventListener('message', e => {
          obs.next(JSON.parse(e.data));
        });
        ws.addEventListener('close', () => {
          obs.complete();
        });
        return () => ws.close();
      } catch (err) {
        obs.error(err);
      }
    });
  }
  onMessage<T>(type?: string) {
    console.log(this.message);
    let msg$ = this.message;
    if (type) {
      msg$ = msg$.pipe(filter(msg => msg.Type === type));
    }
    return msg$.pipe(map(msg => msg.Data as T));
  }
}
interface Message {
  ID: number;
  Type: MessageType;
  Data: any;
}

export enum MessageType {
  AppsChange = 'apps-change',
}
