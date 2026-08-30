import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Motorista } from '../models/motorista.model';

@Injectable({
  providedIn: 'root'
})
export class MotoristaService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private get url(): string {
    return `${this.auth.apiUrl()}/motoristas`;
  }

  listar(): Observable<Motorista[]> {
    return this.http.get<Motorista[]>(this.url);
  }

  buscarPorId(id: string): Observable<Motorista> {
    return this.http.get<Motorista>(`${this.url}/${id}`);
  }

  criar(motorista: { nome: string; email: string; ativo?: boolean }): Observable<Motorista> {
    return this.http.post<Motorista>(this.url, motorista);
  }
}
