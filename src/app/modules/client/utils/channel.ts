import * as _ from 'lodash';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

console.log({ environment });

type CallBack = () => void;
interface Signal {
  connect: (callback: CallBack) => void;
  disconnect: (callback: CallBack) => void;
}

function emptySignal(path: string): Signal {
  return {
    connect(callback: CallBack) {
      console.warn('empty signal', path);
    },
    disconnect(callback: CallBack) {},
  };
}

// Client channel
export const Channel = {
  get debug() {
    return !environment.production || environment.remoteDebug;
  },
  getSlot(path: string): (...args: any) => void {
    const emptySlot = () => console.warn('empty slot', path);
    return _.get(window, 'dstore.channel.objects.' + path, emptySlot);
  },
  getSignal(path: string) {
    return _.get(window, 'dstore.channel.objects.' + path, emptySignal(path)) as Signal;
  },

  async exec<T>(method: string, ...args: any[]): Promise<T> {
    if (!this.debug) {
      return new Promise<T>(resolve => Channel.getSlot(method)(...[...args, resolve]));
    }
    const t = performance.now();
    const resp = await new Promise<T>(resolve => Channel.getSlot(method)(...args, resolve));
    const consumes = performance.now() - t;
    if(localStorage.loggerOn){
      console.warn('[exec]', method, { time: consumes.toFixed(2) + 'ms', args, resp });
    }
    return resp;
  },
  connect<T>(method: string): Observable<T> {
    if (this.debug) {
      console.warn('[connect]', method);
    }
    return new Observable<T>(obs => {
      const handle = (...resp: Array<T>) => {
        if (this.debug) {
          console.warn('[signal]', method, resp);
        }
        if (resp.length > 1) {
          obs.next(resp as any);
        } else {
          obs.next(resp[0]);
        }
      };
      Channel.getSignal(method).connect(handle);
      return () => {
        if (this.debug) {
          console.warn('[disconnect]', method);
        }
        Channel.getSignal(method).disconnect(handle);
      };
    });
  },
};
