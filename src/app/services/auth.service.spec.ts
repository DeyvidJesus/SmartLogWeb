import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created with admin role', () => {
    expect(service).toBeTruthy();
    expect(service.isAdmin()).toBe(true);
    expect(service.currentUser().role).toBe('ADMIN');
  });

  it('should update token and empresaId', () => {
    service.setToken('custom-jwt-token');
    expect(service.token()).toBe('custom-jwt-token');

    service.setEmpresaId('empresa-999');
    expect(service.empresaId()).toBe('empresa-999');
    expect(service.currentUser().empresaId).toBe('empresa-999');
  });
});
