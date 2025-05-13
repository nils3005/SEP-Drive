import { TestBed } from '@angular/core/testing';
import { JwtInterceptor } from './jwt.interceptor';
import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { of } from 'rxjs';

describe('JwtInterceptor', () => {
  let interceptor: JwtInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JwtInterceptor],
    });

    interceptor = TestBed.inject(JwtInterceptor);
  });

  it('should add Authorization header if JWT exists in localStorage', () => {
    // Simuliere Token im Storage
    localStorage.setItem('jwt', 'my-test-token');

    const request = new HttpRequest('GET', '/api/test');
    const next: HttpHandler = {
      handle: (req: HttpRequest<any>) => {
        expect(req.headers.has('Authorization')).toBeTrue();
        expect(req.headers.get('Authorization')).toBe('Bearer my-test-token');
        return of(); // Gibt leeres Observable zurück
      }
    };

    interceptor.intercept(request, next).subscribe();
  });

  it('should not add Authorization header if JWT does not exist', () => {
    localStorage.removeItem('jwt');

    const request = new HttpRequest('GET', '/api/test');
    const next: HttpHandler = {
      handle: (req: HttpRequest<any>) => {
        expect(req.headers.has('Authorization')).toBeFalse();
        return of(); // Gibt leeres Observable zurück
      }
    };

    interceptor.intercept(request, next).subscribe();
  });
});
