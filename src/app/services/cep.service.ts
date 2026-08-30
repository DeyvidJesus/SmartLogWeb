import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { ViaCepResponse } from '../models/cep.model';

@Injectable({
  providedIn: 'root'
})
export class CepService {
  private readonly http = inject(HttpClient);

  consultarCep(cep: string): Observable<ViaCepResponse | null> {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return of(null);
    return this.http.get<ViaCepResponse>(`https://viacep.com.br/ws/${cepLimpo}/json/`).pipe(
      catchError(() => of(null))
    );
  }
}
