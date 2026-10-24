import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  if (!req.url.startsWith(auth.apiUrl() + '/')) return next(req);
  if (req.url.startsWith(auth.apiUrl() + '/rastreamento/')) return next(req);
  return from(auth.getValidToken()).pipe(
    switchMap((token) =>
      next(token ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : req),
    ),
  );
};
