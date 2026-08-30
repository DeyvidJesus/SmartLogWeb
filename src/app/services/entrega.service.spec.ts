import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EntregaService } from './entrega.service';
import { Entrega, CriarEntregaRequest } from '../models/entrega.model';

describe('EntregaService', () => {
  let service: EntregaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EntregaService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(EntregaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list entregas from API', () => {
    const mockEntregas: Entrega[] = [
      {
        id: 'e1',
        codigo: 'ENT-001',
        empresaId: 'empresa-001',
        clienteId: 'c1',
        rotaId: 'r1',
        motoristaId: 'm1',
        status: 'PENDENTE',
        origem: 'SP',
        destino: 'RJ',
        criadaEm: '2026-08-27T12:00:00Z',
        atualizadaEm: '2026-08-27T12:00:00Z'
      }
    ];

    service.listar().subscribe((data) => {
      expect(data.length).toBe(1);
      expect(data[0].codigo).toBe('ENT-001');
    });

    const req = httpMock.expectOne('/api/v1/entregas');
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockEntregas });
  });

  it('should create entrega via POST', () => {
    const dto: CriarEntregaRequest = {
      clienteId: 'c1',
      rotaId: 'r1',
      origem: 'Origem A',
      destino: 'Destino B'
    };

    const mockResponse: Entrega = {
      id: 'e2',
      codigo: 'ENT-NEW',
      empresaId: 'empresa-001',
      clienteId: 'c1',
      rotaId: 'r1',
      motoristaId: null,
      status: 'PENDENTE',
      origem: 'Origem A',
      destino: 'Destino B',
      criadaEm: '2026-08-27T13:00:00Z',
      atualizadaEm: '2026-08-27T13:00:00Z'
    };

    service.criar(dto).subscribe((res) => {
      expect(res.id).toBe('e2');
      expect(res.codigo).toBe('ENT-NEW');
    });

    const req = httpMock.expectOne('/api/v1/entregas');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockResponse);
  });

  it('should update status via PATCH', () => {
    const mockUpdated: Entrega = {
      id: 'e1',
      codigo: 'ENT-001',
      empresaId: 'empresa-001',
      clienteId: 'c1',
      rotaId: 'r1',
      motoristaId: 'm1',
      status: 'EM_TRANSITO',
      origem: 'SP',
      destino: 'RJ',
      criadaEm: '2026-08-27T12:00:00Z',
      atualizadaEm: '2026-08-27T14:00:00Z'
    };

    service.atualizarStatus('e1', 'EM_TRANSITO').subscribe((res) => {
      expect(res.status).toBe('EM_TRANSITO');
    });

    const req = httpMock.expectOne('/api/v1/entregas/e1/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'EM_TRANSITO' });
    req.flush(mockUpdated);
  });
});
