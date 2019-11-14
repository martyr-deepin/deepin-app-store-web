import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { UnauthorizedService } from './unauthorized.service';

@Injectable()
export class ProxyInterceptor implements HttpInterceptor {
  constructor(private unauthorized: UnauthorizedService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (req.url[0] !== '/') {
      return next.handle(req);
    }
    const url = environment.server + req.url;
    const env = environment.store_env;
    let params = req.params;
    Object.keys(env).forEach(key => (params = params.set(key, env[key])));
    req = req.clone({ url, params });

    const token = localStorage.getItem('token');
    if (token) {
      req = req.clone({ setHeaders: { Authorization: 'Bearer ' + token } });
    }
    return next.handle(req).pipe(
      catchError(err => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this.unauthorized.unauthorized$.next();
          }
        }
        throw err;
      }),
    );
  }
}
