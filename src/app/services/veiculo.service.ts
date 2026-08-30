import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Veiculo, CriarVeiculoRequest } from '../models/veiculo.model';

@Injectable({
  providedIn: 'root'
})
export class VeiculoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/veiculos';

  listar(): Observable<Veiculo[]> {
    return this.http.get<Veiculo[]>(this.baseUrl);
  }

  buscarPorId(id: string): Observable<Veiculo> {
    return this.http.get<Veiculo>(`${this.baseUrl}/${id}`);
  }

  criar(dados: CriarVeiculoRequest): Observable<Veiculo> {
    return this.http.post<Veiculo>(this.baseUrl, dados);
  }

  atualizar(id: string, dados: CriarVeiculoRequest): Observable<Veiculo> {
    return this.http.put<Veiculo>(`${this.baseUrl}/${id}`, dados);
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
