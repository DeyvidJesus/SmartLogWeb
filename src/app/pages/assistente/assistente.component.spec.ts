import {TestBed} from '@angular/core/testing';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {AssistenteComponent} from './assistente.component';
import {AuthService} from '../../services/auth.service';
import {authInterceptor} from '../../services/auth.interceptor';

describe('Dashboard assistant API integration', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AssistenteComponent],
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {provide: AuthService, useValue: {apiUrl: () => '/api/v1', getValidToken: async () => 'verified-session'}},
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('uses the authenticated shared chat API and displays its response', async () => {
    const fixture = TestBed.createComponent(AssistenteComponent);
    fixture.componentInstance.question = 'Há entregas atrasadas?';
    fixture.componentInstance.send();
    await Promise.resolve();
    const request = http.expectOne('/api/v1/chat');
    expect(request.request.headers.get('Authorization')).toBe('Bearer verified-session');
    expect(request.request.body).toEqual({pergunta: 'Há entregas atrasadas?', historico: []});
    request.flush({resposta: 'ENT-NEXT-07 está atrasada.', provedor: 'gemini'});
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('ENT-NEXT-07 está atrasada.');
    expect(fixture.componentInstance.busy()).toBe(false);
  });

  it('shows the API failure and preserves the question for retry', async () => {
    const fixture = TestBed.createComponent(AssistenteComponent);
    fixture.componentInstance.question = 'Minha entrega?';
    fixture.componentInstance.send();
    await Promise.resolve();
    http.expectOne('/api/v1/chat').flush({message: 'Aguarde alguns segundos antes da próxima pergunta.'}, {status: 429, statusText: 'Too Many Requests'});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Aguarde alguns segundos');
    expect(fixture.componentInstance.question).toBe('Minha entrega?');
    expect(fixture.componentInstance.busy()).toBe(false);
    expect(fixture.componentInstance.messages().filter(row => row.role === 'assistant')).toHaveLength(0);
  });
});
