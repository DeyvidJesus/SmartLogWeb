import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Occurrence, Receipt, Tracking } from '../models/delivery-experience.model';

@Injectable({ providedIn: 'root' })
export class DeliveryExperienceService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private path(id: string) {
    return `${this.auth.apiUrl()}/entregas/${encodeURIComponent(id)}`;
  }
  receipt(id: string) {
    return this.http.get<Receipt>(`${this.path(id)}/comprovante`);
  }
  occurrences(id: string) {
    return this.http.get<Occurrence[]>(`${this.path(id)}/ocorrencias`);
  }
  allOccurrences() {
    return this.http.get<Occurrence[]>(`${this.auth.apiUrl()}/ocorrencias`);
  }
  occurrence(id: string, oid: string) {
    return this.http.get<Occurrence>(`${this.path(id)}/ocorrencias/${oid}`);
  }
  resolve(id: string, oid: string, resolucao: string, mensagemCliente: string) {
    return this.http.patch<Occurrence>(`${this.path(id)}/ocorrencias/${oid}`, {
      resolucao,
      mensagemCliente,
    });
  }
  share(id: string) {
    return this.http.post<{ caminho: string; expiraEm: string }>(
      `${this.path(id)}/rastreamento`,
      {},
    );
  }
  revoke(id: string) {
    return this.http.delete<void>(`${this.path(id)}/rastreamento`);
  }
  tracking(token: string) {
    return this.http.get<Tracking>(
      `${this.auth.apiUrl()}/rastreamento/${encodeURIComponent(token)}`,
    );
  }
}
