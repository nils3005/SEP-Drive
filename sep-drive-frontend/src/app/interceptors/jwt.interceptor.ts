import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptorFn,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const url = request.url;

    if (url.startsWith('http://localhost') && (!url.includes('auth')) || url.includes('logout')){
      const jwt = localStorage.getItem('jwt');
      if (jwt) {
        //klont die anfrage und schickt dem server den token
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${jwt}`,
          },
        });
      }
    }
    //anfrage wird weitergeschickt
    return next.handle(request);
  }
}
