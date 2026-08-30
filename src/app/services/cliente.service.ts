import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private get url(): string {
    return `${this.auth.apiUrl()}/clientes`;
  }

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.url);
  }

  buscarPorId(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.url}/${id}`);
  }

  criar(cliente: { nome: string; email: string; telefone: string; ativo?: boolean }): Observable<Cliente> {
    return this.http.post<Cliente>(this.url, cliente);
  }
}
