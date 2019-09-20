import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { environment } from 'environments/environment';

@Injectable()
export class ProxyInterceptor implements HttpInterceptor {
  constructor() {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (req.url[0] !== '/') {
      return next.handle(req);
    }
    const url = environment.server + req.url;
    const env = environment.store_env;
    let params = req.params;
    Object.keys(env).forEach(key => (params = params.set(key, env[key])));
    return next.handle(req.clone({ url, params }));
  }
}
