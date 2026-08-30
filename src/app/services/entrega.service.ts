import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import { Entrega, EntregaListResponse, EntregaStatus, CriarEntregaRequest, AtualizarStatusRequest } from '../models/entrega.model';

@Injectable({
  providedIn: 'root'
})
export class EntregaService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private get url(): string {
    return `${this.auth.apiUrl()}/entregas`;
  }

  listar(filtros?: {
    status?: EntregaStatus;
    rotaId?: string;
    motoristaId?: string;
    clienteId?: string;
  }): Observable<Entrega[]> {
    let params = new HttpParams();
    if (filtros?.status) {
      params = params.set('status', filtros.status);
    }
    if (filtros?.rotaId) {
      params = params.set('rotaId', filtros.rotaId);
    }
    if (filtros?.motoristaId) {
      params = params.set('motoristaId', filtros.motoristaId);
    }
    if (filtros?.clienteId) {
      params = params.set('clienteId', filtros.clienteId);
    }

    return this.http.get<EntregaListResponse>(this.url, { params }).pipe(
      map(response => response.data || [])
    );
  }

  buscarPorId(id: string): Observable<Entrega> {
    return this.http.get<Entrega>(`${this.url}/${id}`);
  }

  criar(request: CriarEntregaRequest): Observable<Entrega> {
    return this.http.post<Entrega>(this.url, request);
  }

  atualizarStatus(id: string, status: EntregaStatus): Observable<Entrega> {
    const body: AtualizarStatusRequest = { status };
    return this.http.patch<Entrega>(`${this.url}/${id}/status`, body);
  }
}
