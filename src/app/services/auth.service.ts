import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

export interface UserProfile {
  uid: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'MOTORISTA' | 'CLIENTE';
  empresaId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'smartlog_token';
  private readonly EMPRESA_KEY = 'smartlog_empresa_id';
  private readonly API_URL_KEY = 'smartlog_api_url';

  readonly token = signal<string>(this.getStoredToken());
  readonly empresaId = signal<string>(this.getStoredEmpresaId());
  readonly apiUrl = signal<string>(this.getStoredApiUrl());
  readonly currentUser = signal<UserProfile>({
    uid: 'admin-master-001',
    nome: 'Deyvid Admin',
    email: 'admin@smartlog.com.br',
    role: 'ADMIN',
    empresaId: this.getStoredEmpresaId()
  });

  private getStoredToken(): string {
    return localStorage.getItem(this.TOKEN_KEY) || environment.devAuthToken;
  }

  private getStoredEmpresaId(): string {
    return localStorage.getItem(this.EMPRESA_KEY) || environment.defaultEmpresaId;
  }

  private getStoredApiUrl(): string {
    return localStorage.getItem(this.API_URL_KEY) || environment.apiUrl;
  }

  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.token.set(token);
  }

  setEmpresaId(empresaId: string) {
    localStorage.setItem(this.EMPRESA_KEY, empresaId);
    this.empresaId.set(empresaId);
    this.currentUser.update(u => ({ ...u, empresaId }));
  }

  setApiUrl(apiUrl: string) {
    localStorage.setItem(this.API_URL_KEY, apiUrl);
    this.apiUrl.set(apiUrl);
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  isAdmin(): boolean {
    return this.currentUser().role === 'ADMIN';
  }
}
