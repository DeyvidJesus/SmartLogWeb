import {TestBed} from '@angular/core/testing';
import {of,throwError,firstValueFrom} from 'rxjs';
import {DashboardService} from './dashboard.service';
import {EntregaService} from './entrega.service';
import {RotaService} from './rota.service';
import {MotoristaService} from './motorista.service';
import {ClienteService} from './cliente.service';
import {VeiculoService} from './veiculo.service';
describe('Dashboard operational truth',()=>{
  function service(entregas:any) {
    TestBed.configureTestingModule({providers:[
      {provide:EntregaService,useValue:{listar:()=>entregas}},
      ...[RotaService,MotoristaService,ClienteService,VeiculoService].map(token=>({provide:token,useValue:{listar:()=>of([])}}))
    ]});return TestBed.inject(DashboardService);
  }
  it('calculates completion over all orders, without fabricated KPIs',async()=>{
    const result=await firstValueFrom(service(of([
      {id:'1',codigo:'ENT-1',status:'ENTREGUE',motoristaId:'m',criadaEm:'2026-01-01'},
      {id:'2',codigo:'ENT-2',status:'PENDENTE',motoristaId:'m',criadaEm:'2026-01-01'},
      {id:'3',codigo:'ENT-3',status:'EM_ROTA',motoristaId:'m',criadaEm:'2026-01-01'},
      {id:'4',codigo:'ENT-4',status:'ENTREGUE',motoristaId:'m',criadaEm:'2026-01-01'}
    ])).getDashboardData());
    expect(result.metrics.taxaSucesso).toBe(50);
    expect(result.metrics.alertas).toEqual([]);
    expect(result.metrics).not.toHaveProperty('otifPercentual');
  });
  it('propagates a failure instead of producing a healthy empty operation',async()=>{
    await expect(firstValueFrom(service(throwError(()=>new Error('offline'))).getDashboardData())).rejects.toThrow('offline');
  });
  it('creates only alerts supported by the records',async()=>{
    const result=await firstValueFrom(service(of([{id:'1',codigo:'ENT-1',status:'PENDENTE',motoristaId:null,criadaEm:'2026-01-01'}])).getDashboardData());
    expect(result.metrics.alertas[0].titulo).toContain('ENT-1');
    expect(result.metrics.alertas[0].titulo).toContain('sem motorista');
  });
});
