import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Rota } from '../models/rota.model';

@Injectable({
  providedIn: 'root'
})
export class RotaService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private get url(): string {
    return `${this.auth.apiUrl()}/rotas`;
  }

  listar(): Observable<Rota[]> {
    return this.http.get<Rota[]>(this.url);
  }

  buscarPorId(id: string): Observable<Rota> {
    return this.http.get<Rota>(`${this.url}/${id}`);
  }

  criar(rota: { nome: string; motoristaId?: string }): Observable<Rota> {
    return this.http.post<Rota>(this.url, rota);
  }
}
