import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RotaService } from '../../services/rota.service';
import { MotoristaService } from '../../services/motorista.service';
import { NotificationService } from '../../services/notification.service';
import { Rota } from '../../models/rota.model';
import { Motorista } from '../../models/motorista.model';

@Component({
  selector: 'app-rotas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rotas.component.html',
  styleUrl: './rotas.component.css'
})
export class RotasComponent implements OnInit {
  private readonly rotaService = inject(RotaService);
  private readonly motoristaService = inject(MotoristaService);
  private readonly notificationService = inject(NotificationService);

  readonly rotas = signal<Rota[]>([]);
  readonly motoristas = signal<Motorista[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isSubmitting = signal<boolean>(false);

  termoBusca: string = '';
  filtroStatus: string = 'TODAS';

  rotaSelecionada: Rota | null = null;
  showModalDetalhes: boolean = false;
  showModalCriar: boolean = false;

  novaRota = {
    nome: '',
    motoristaId: '',
    status: 'PLANEJADA'
  };

  ngOnInit() {
    this.carregarRotas();
    this.motoristaService.listar().subscribe({ next: m => this.motoristas.set(m) });
  }

  carregarRotas() {
    this.isLoading.set(true);
    this.rotaService.listar().subscribe({
      next: (data) => {
        this.rotas.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  abrirModalCriar() {
    this.novaRota = {
      nome: '',
      motoristaId: this.motoristas().length > 0 ? this.motoristas()[0].id : '',
      status: 'PLANEJADA'
    };
    this.showModalCriar = true;
  }

  fecharModalCriar() {
    this.showModalCriar = false;
  }

  salvarNovaRota() {
    if (!this.novaRota.nome.trim()) {
      this.notificationService.warning('Aviso', 'Informe o nome da rota.');
      return;
    }

    this.isSubmitting.set(true);
    this.rotaService.criar(this.novaRota).subscribe({
      next: (criada) => {
        this.isSubmitting.set(false);
        this.fecharModalCriar();
        this.notificationService.success('Rota Criada!', criada.nome);
        this.rotas.update(r => [criada, ...r]);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.notificationService.error('Erro', 'Falha ao salvar rota.');
      }
    });
  }

  abrirDetalhes(rota: Rota) {
    this.rotaSelecionada = rota;
    this.showModalDetalhes = true;
  }

  fecharDetalhes() {
    this.showModalDetalhes = false;
    this.rotaSelecionada = null;
  }

  get rotasFiltradas(): Rota[] {
    return this.rotas().filter(r => {
      const matchStatus = this.filtroStatus === 'TODAS' || 
        (r.status || 'PLANEJADA').toUpperCase() === this.filtroStatus.toUpperCase();
      
      const busca = this.termoBusca.toLowerCase().trim();
      const matchBusca = !busca || 
        r.nome.toLowerCase().includes(busca) ||
        r.id.toLowerCase().includes(busca) ||
        (r.motoristaId && r.motoristaId.toLowerCase().includes(busca));

      return matchStatus && matchBusca;
    });
  }

  getContador(status: string): number {
    if (status === 'TODAS') return this.rotas().length;
    return this.rotas().filter(r => (r.status || 'PLANEJADA').toUpperCase() === status.toUpperCase()).length;
  }
}
