import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DeliveryExperienceService } from './delivery-experience.service';
import { AuthService } from './auth.service';

describe('Delivery experience API contract', () => {
  let service: DeliveryExperienceService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { apiUrl: () => '/api/v1' } },
      ],
    });
    service = TestBed.inject(DeliveryExperienceService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('loads evidence from the API and resolves the exact occurrence with the public customer message', () => {
    service.receipt('delivery-a').subscribe((proof) => expect(proof.recebedor).toBe('Maria'));
    http.expectOne('/api/v1/entregas/delivery-a/comprovante').flush({ recebedor: 'Maria' });
    service
      .resolve('delivery-a', 'case-a', 'Nova tentativa agendada', 'Entregaremos amanhã.')
      .subscribe();
    const request = http.expectOne('/api/v1/entregas/delivery-a/ocorrencias/case-a');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      resolucao: 'Nova tentativa agendada',
      mensagemCliente: 'Entregaremos amanhã.',
    });
    request.flush({ status: 'RESOLVIDA' });
  });
  it('creates and revokes a delivery-scoped share link without placing credentials in the URL', () => {
    service.share('delivery-a').subscribe();
    const request = http.expectOne('/api/v1/entregas/delivery-a/rastreamento');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    request.flush({ caminho: '/acompanhar/opaque-token' });
    service.revoke('delivery-a').subscribe();
    const revoke = http.expectOne('/api/v1/entregas/delivery-a/rastreamento');
    expect(revoke.request.method).toBe('DELETE');
    revoke.flush(null, { status: 204, statusText: 'No Content' });
  });
  it('propagates expired tracking and never invents a delivery', () => {
    let rejected = false;
    service.tracking('expired-token').subscribe({
      next: () => {
        throw new Error('Unexpected invented data');
      },
      error: (err) => {
        rejected = err.status === 404;
      },
    });
    http
      .expectOne('/api/v1/rastreamento/expired-token')
      .flush({ message: 'Link inválido ou expirado.' }, { status: 404, statusText: 'Not Found' });
    expect(rejected).toBe(true);
  });
});
