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
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      //klont die anfrage und schickt dem server den token
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      return next.handle(authRequest);
    }
    //anfrage wird weitergeschickt
    return next.handle(request);
  }
}
