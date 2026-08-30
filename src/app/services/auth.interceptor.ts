import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const token = authService.token();
  let authReq = req;

  if (token && req.url.includes('/api/')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro na requisição.';
      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 401) {
        errorMessage = 'Autenticação necessária ou token não configurado.';
      } else if (error.status === 403) {
        errorMessage = 'Acesso não autorizado para este recurso.';
      } else if (error.status === 404) {
        errorMessage = 'Recurso não encontrado.';
      } else if (error.status === 0) {
        errorMessage = 'Não foi possível conectar à API. Verifique se o backend está em execução.';
      }

      console.error(`[HTTP Error ${error.status}]`, errorMessage, error);
      return throwError(() => error);
    })
  );
};
