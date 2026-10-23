import { Injectable, inject } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { EntregaService } from './entrega.service';
import { RotaService } from './rota.service';
import { MotoristaService } from './motorista.service';
import { ClienteService } from './cliente.service';
import { VeiculoService } from './veiculo.service';
import { DashboardMetrics, AlertaOperacional } from '../models/dashboard.model';
@Injectable({providedIn:'root'})
export class DashboardService {
  private entrega=inject(EntregaService); private rota=inject(RotaService);
  private motorista=inject(MotoristaService); private cliente=inject(ClienteService); private veiculo=inject(VeiculoService);
  getDashboardData() {
    return forkJoin({entregas:this.entrega.listar(),rotas:this.rota.listar(),motoristas:this.motorista.listar(),clientes:this.cliente.listar(),veiculos:this.veiculo.listar()}).pipe(
      map(({entregas,rotas,motoristas,clientes,veiculos})=>{
        const total=entregas.length;
        const pendentes=entregas.filter(e=>(e.status==='PENDENTE'||e.status==='ATRASADA')).length;
        const emTransito=entregas.filter(e=>e.status==='EM_ROTA'||e.status==='EM_TRANSITO').length;
        const entregues=entregas.filter(e=>e.status==='ENTREGUE').length;
        const canceladas=entregas.filter(e=>e.status==='CANCELADA').length;
        const alertas:AlertaOperacional[]=entregas.filter(e=>!e.motoristaId && e.status!=='ENTREGUE' && e.status!=='CANCELADA').map(e=>({
          id:e.id,tipo:'ALERTA',titulo:e.codigo+' sem motorista',descricao:'Atribua a entrega a uma rota com motorista antes do despacho.',tempo:'Verificado nesta consulta'
        }));
        const metrics:DashboardMetrics={totalEntregas:total,pendentes,emTransito,entregues,canceladas,
          taxaSucesso:total ? Math.round(entregues/total*100):0,totalRotas:rotas.length,
          totalMotoristas:motoristas.filter(m=>m.ativo).length,totalClientes:clientes.length,totalVeiculos:veiculos.filter(v=>v.ativo).length,
          alertas};
        return {metrics,rotas,entregasRecentes:[...entregas].sort((a,b)=>Date.parse(b.atualizadaEm||b.criadaEm)-Date.parse(a.atualizadaEm||a.criadaEm)).slice(0,6)};
      })
    );
  }
}
