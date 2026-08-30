import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntregaService } from '../../services/entrega.service';
import { RotaService } from '../../services/rota.service';
import { ClienteService } from '../../services/cliente.service';
import { MotoristaService } from '../../services/motorista.service';
import { VeiculoService } from '../../services/veiculo.service';
import { CepService } from '../../services/cep.service';
import { NotificationService } from '../../services/notification.service';
import { Entrega, EntregaStatus, CriarEntregaRequest } from '../../models/entrega.model';
import { Rota } from '../../models/rota.model';
import { Cliente } from '../../models/cliente.model';
import { Motorista } from '../../models/motorista.model';
import { Veiculo } from '../../models/veiculo.model';

@Component({
  selector: 'app-entregas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entregas.component.html',
  styleUrl: './entregas.component.css'
})
export class EntregasComponent implements OnInit {
  private readonly entregaService = inject(EntregaService);
  private readonly rotaService = inject(RotaService);
  private readonly clienteService = inject(ClienteService);
  private readonly motoristaService = inject(MotoristaService);
  private readonly veiculoService = inject(VeiculoService);
  private readonly cepService = inject(CepService);
  private readonly notificationService = inject(NotificationService);

  readonly isLoading = signal<boolean>(true);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly entregas = signal<Entrega[]>([]);
  readonly rotas = signal<Rota[]>([]);
  readonly clientes = signal<Cliente[]>([]);
  readonly motoristas = signal<Motorista[]>([]);
  readonly veiculos = signal<Veiculo[]>([]);

  termoBusca: string = '';
  filtroStatus: string = 'TODOS';

  showModalCriar: boolean = false;
  showModalStatus: boolean = false;
  showModalDetalhes: boolean = false;

  cepBusca: string = '';
  isBuscandoCep: boolean = false;

  novaEntrega: CriarEntregaRequest = {
    clienteId: '',
    rotaId: '',
    origem: 'CD Central São Paulo - Rod. Anhanguera, km 15',
    destino: '',
    chaveNfe: '',
    valorNfe: 1250.00,
    pesoKg: 180,
    volumeM3: 1.2,
    volumes: 4,
    janelaEntrega: 'MANHA'
  };

  entregaSelecionada: Entrega | null = null;
  novoStatus: EntregaStatus = 'PENDENTE';

  ngOnInit() {
    this.carregarEntregas();
    this.carregarDadosAuxiliares();
  }

  carregarEntregas() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.entregaService.listar().subscribe({
      next: (data) => {
        this.entregas.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Erro ao carregar lista de entregas da API. Verifique a conexão com o servidor.');
        this.notificationService.error('Erro na API', 'Não foi possível carregar as entregas.');
      }
    });
  }

  carregarDadosAuxiliares() {
    this.rotaService.listar().subscribe({ next: (r) => this.rotas.set(r) });
    this.clienteService.listar().subscribe({ next: (c) => this.clientes.set(c) });
    this.motoristaService.listar().subscribe({ next: (m) => this.motoristas.set(m) });
    this.veiculoService.listar().subscribe({ next: (v) => this.veiculos.set(v) });
  }

  abrirModalCriar() {
    const defaultCliente = this.clientes().length > 0 ? this.clientes()[0].id : 'cliente-001';
    const defaultRota = this.rotas().length > 0 ? this.rotas()[0].id : 'rota-001';

    this.novaEntrega = {
      clienteId: defaultCliente,
      rotaId: defaultRota,
      origem: 'CD Central Smart Res - Rod. Anhanguera, km 15 - SP',
      destino: '',
      chaveNfe: '3526' + Math.floor(100000000000 + Math.random() * 900000000000),
      valorNfe: 2450.00,
      pesoKg: 320,
      volumeM3: 2.5,
      volumes: 8,
      janelaEntrega: 'MANHA'
    };
    this.cepBusca = '01310-100';
    this.onClienteSelecionado(defaultCliente);
    this.showModalCriar = true;
  }

  onClienteSelecionado(clienteId: string) {
    const c = this.clientes().find(x => x.id === clienteId);
    if (c) {
      if (c.nome.includes('ABC')) {
        this.novaEntrega.destino = 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP';
        this.cepBusca = '01310-100';
        this.novaEntrega.rotaId = 'rota-001';
      } else if (c.nome.includes('Nacional')) {
        this.novaEntrega.destino = 'Rua das Flores, 250 - Centro, Campinas - SP';
        this.cepBusca = '13010-000';
        this.novaEntrega.rotaId = 'rota-001';
      } else {
        this.novaEntrega.destino = 'Av. Brasil, 500 - Gonzaga, Santos - SP';
        this.cepBusca = '11050-000';
        this.novaEntrega.rotaId = 'rota-002';
      }
    }
  }

  buscarCep() {
    if (!this.cepBusca) return;
    this.isBuscandoCep = true;
    this.cepService.consultarCep(this.cepBusca).subscribe({
      next: (res) => {
        this.isBuscandoCep = false;
        if (res && !res.erro) {
          this.novaEntrega.destino = `${res.logradouro}, nº ___ - ${res.bairro}, ${res.localidade} - ${res.uf}`;
          this.notificationService.success('CEP Encontrado', `${res.localidade} / ${res.uf}`);
        } else {
          this.notificationService.warning('CEP não localizado', 'Preencha o endereço manualmente.');
        }
      },
      error: () => {
        this.isBuscandoCep = false;
      }
    });
  }

  fecharModalCriar() {
    this.showModalCriar = false;
  }

  salvarNovaEntrega() {
    if (!this.novaEntrega.origem.trim() || !this.novaEntrega.destino.trim()) {
      this.notificationService.warning('Campos Obrigatórios', 'Preencha os endereços de Origem e Destino.');
      return;
    }

    if (!this.novaEntrega.clienteId.trim() || !this.novaEntrega.rotaId.trim()) {
      this.notificationService.warning('Campos Obrigatórios', 'Selecione o Cliente e a Rota.');
      return;
    }

    this.isSubmitting.set(true);

    this.entregaService.criar(this.novaEntrega).subscribe({
      next: (entregaCriada) => {
        this.isSubmitting.set(false);
        this.fecharModalCriar();
        this.notificationService.success('Entrega Cadastrada!', `Código: ${entregaCriada.codigo}`);
        this.entregas.update(current => [entregaCriada, ...current]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || 'Falha ao cadastrar entrega no servidor.';
        this.notificationService.error('Erro ao Salvar', msg);
      }
    });
  }

  abrirModalStatus(entrega: Entrega) {
    this.entregaSelecionada = entrega;
    this.novoStatus = entrega.status;
    this.showModalStatus = true;
  }

  fecharModalStatus() {
    this.showModalStatus = false;
    this.entregaSelecionada = null;
  }

  salvarNovoStatus() {
    if (!this.entregaSelecionada) return;

    this.isSubmitting.set(true);
    const id = this.entregaSelecionada.id;
    const status = this.novoStatus;

    this.entregaService.atualizarStatus(id, status).subscribe({
      next: (entregaAtualizada) => {
        this.isSubmitting.set(false);
        this.fecharModalStatus();
        this.notificationService.success('Status Atualizado!', `Entrega ${entregaAtualizada.codigo} -> ${this.getStatusLabel(status)}`);
        this.entregas.update(current => 
          current.map(e => e.id === id ? entregaAtualizada : e)
        );
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || 'Falha ao atualizar status.';
        this.notificationService.error('Erro ao Atualizar', msg);
      }
    });
  }

  abrirModalDetalhes(entrega: Entrega) {
    this.entregaSelecionada = entrega;
    this.showModalDetalhes = true;
  }

  fecharModalDetalhes() {
    this.showModalDetalhes = false;
    this.entregaSelecionada = null;
  }

  get entregasFiltradas(): Entrega[] {
    return this.entregas().filter(entrega => {
      const matchStatus = this.filtroStatus === 'TODOS' || 
        entrega.status === this.filtroStatus ||
        (this.filtroStatus === 'EM_ROTA' && (entrega.status === 'EM_ROTA' || entrega.status === 'EM_TRANSITO'));
      
      const busca = this.termoBusca.toLowerCase().trim();
      const matchBusca = !busca || 
        entrega.codigo.toLowerCase().includes(busca) ||
        entrega.origem.toLowerCase().includes(busca) ||
        entrega.destino.toLowerCase().includes(busca) ||
        entrega.clienteId.toLowerCase().includes(busca) ||
        entrega.rotaId.toLowerCase().includes(busca);

      return matchStatus && matchBusca;
    });
  }

  getContador(status: string): number {
    if (status === 'TODOS') return this.entregas().length;
    if (status === 'EM_ROTA') return this.entregas().filter(e => e.status === 'EM_ROTA' || e.status === 'EM_TRANSITO').length;
    return this.entregas().filter(e => e.status === status).length;
  }

  getStatusClass(status: EntregaStatus): string {
    switch (status) {
      case 'PENDENTE': return 'badge-pendente';
      case 'EM_ROTA':
      case 'EM_TRANSITO': return 'badge-transito';
      case 'ENTREGUE': return 'badge-entregue';
      case 'CANCELADA': return 'badge-cancelada';
      default: return '';
    }
  }

  getStatusLabel(status: EntregaStatus): string {
    switch (status) {
      case 'PENDENTE': return 'Pendente';
      case 'EM_ROTA': return 'Em Rota';
      case 'EM_TRANSITO': return 'Em Trânsito';
      case 'ENTREGUE': return 'Entregue';
      case 'CANCELADA': return 'Cancelada';
      default: return status;
    }
  }

  getNomeCliente(clienteId: string): string {
    const c = this.clientes().find(x => x.id === clienteId);
    return c ? c.nome : clienteId;
  }

  getNomeRota(rotaId: string): string {
    const r = this.rotas().find(x => x.id === rotaId);
    return r ? r.nome : rotaId;
  }
}
