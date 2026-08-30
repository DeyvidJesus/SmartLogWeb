import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EntregasComponent } from './entregas.component';
import { EntregaService } from '../../services/entrega.service';
import { of } from 'rxjs';
import { Entrega } from '../../models/entrega.model';

describe('EntregasComponent', () => {
  let component: EntregasComponent;
  let fixture: ComponentFixture<EntregasComponent>;
  let entregaService: EntregaService;

  const mockEntregas: Entrega[] = [
    {
      id: 'e1',
      codigo: 'ENT-001',
      empresaId: 'empresa-001',
      clienteId: 'c1',
      rotaId: 'r1',
      motoristaId: 'm1',
      status: 'PENDENTE',
      origem: 'Origem SP',
      destino: 'Destino RJ',
      criadaEm: '2026-08-27T12:00:00Z',
      atualizadaEm: '2026-08-27T12:00:00Z'
    },
    {
      id: 'e2',
      codigo: 'ENT-002',
      empresaId: 'empresa-001',
      clienteId: 'c2',
      rotaId: 'r2',
      motoristaId: null,
      status: 'ENTREGUE',
      origem: 'Origem MG',
      destino: 'Destino ES',
      criadaEm: '2026-08-27T11:00:00Z',
      atualizadaEm: '2026-08-27T13:00:00Z'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntregasComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    entregaService = TestBed.inject(EntregaService);
    vi.spyOn(entregaService, 'listar').mockReturnValue(of(mockEntregas));

    fixture = TestBed.createComponent(EntregasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component and load entregas from API', () => {
    expect(component).toBeTruthy();
    expect(component.entregas().length).toBe(2);
    expect(component.isLoading()).toBe(false);
  });

  it('should filter entregas by status', () => {
    component.filtroStatus = 'PENDENTE';
    expect(component.entregasFiltradas.length).toBe(1);
    expect(component.entregasFiltradas[0].codigo).toBe('ENT-001');

    component.filtroStatus = 'ENTREGUE';
    expect(component.entregasFiltradas.length).toBe(1);
    expect(component.entregasFiltradas[0].codigo).toBe('ENT-002');
  });

  it('should filter entregas by search term', () => {
    component.termoBusca = 'Origem MG';
    expect(component.entregasFiltradas.length).toBe(1);
    expect(component.entregasFiltradas[0].codigo).toBe('ENT-002');
  });

  it('should open and close create modal', () => {
    component.abrirModalCriar();
    expect(component.showModalCriar).toBe(true);

    component.fecharModalCriar();
    expect(component.showModalCriar).toBe(false);
  });
});
