import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

const SKIP_AUTH_URLS = ['/api/accounting/v1/auth/login', '/api/accounting/v1/auth/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (SKIP_AUTH_URLS.some(url => req.url.includes(url))) {
    return next(req);
  }

  const auth = inject(AuthService);
  if (auth.isLoggedIn()) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${auth.getAccessToken()}` } });
  }
  return next(req);
};
