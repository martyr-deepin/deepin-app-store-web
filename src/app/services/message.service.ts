import { Injectable } from '@angular/core';
import { filter, map, publishReplay } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { AuthService } from './auth.service';
import { ClientIdService } from './client-id.service';
import { StoreService } from 'app/modules/client/services/store.service';
import { refCountDelay } from 'rxjs-etc/operators';

export enum MessageType {
  Ping = 'ping',
  AppsChange = 'apps_changed',
  Refund = 'user_refund',
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(
    private authService: AuthService, 
    private clientID: ClientIdService,
    private storeService:StoreService) {
    this.authService.info$.subscribe(
      info => {
        if(info) {
          this.qwsMessage()
        }
      }
    )
  }

  message$ = this.storeService.onMessage().pipe(
    map(msg => JSON.parse(msg) as Message),
    publishReplay(1),
    refCountDelay(1000),
  )
  
  private Authorization() {
    return 'Bearer ' + localStorage.getItem('token');
  }
 
  private qwsMessage() {
    const url = new URL(`ws://${new URL(environment.server).host}/api/user/message_stream`);
    url.searchParams.set('id', this.clientID.clientID());
    url.searchParams.set('Authorization', this.Authorization());
    this.storeService.newWebSocket(url.toString())
  }

  onMessage<T>(type?:string) {
    let msg$ = this.message$;
    if(type) {
      msg$ = msg$.pipe(filter(msg => msg.Type === type));
    }
    return msg$.pipe(
      map(msg => {
      return msg.Data as T
    }));
  }
}
interface Message {
  ID: number;
  Type: MessageType;
  Data: any;
}
