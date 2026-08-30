import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  get baseUrl(): string {
    return this.auth.apiUrl();
  }

  checkApiHealth(): Observable<{ name: string; version: string; status: string }> {
    return this.http.get<{ name: string; version: string; status: string }>(this.baseUrl);
  }
}
