import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VeiculoService } from '../../services/veiculo.service';
import { NotificationService } from '../../services/notification.service';
import { Veiculo, CriarVeiculoRequest, TipoVeiculo } from '../../models/veiculo.model';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './veiculos.component.html',
  styleUrl: './veiculos.component.css'
})
export class VeiculosComponent implements OnInit {
  private readonly veiculoService = inject(VeiculoService);
  private readonly notificationService = inject(NotificationService);

  readonly veiculos = signal<Veiculo[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isSubmitting = signal<boolean>(false);

  termoBusca: string = '';
  filtroTipo: string = 'TODOS';

  veiculoSelecionado: Veiculo | null = null;
  showModalDetalhes: boolean = false;
  showModalCriar: boolean = false;

  novoVeiculo: CriarVeiculoRequest = {
    placa: '',
    modelo: '',
    tipo: 'VUC',
    capacidadeKg: 5000,
    capacidadeM3: 22,
    ano: 2024,
    ativo: true
  };

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.isLoading.set(true);
    this.veiculoService.listar().subscribe({
      next: (data) => {
        this.veiculos.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.error('Erro', 'Não foi possível carregar a frota.');
      }
    });
  }

  abrirModalCriar() {
    this.novoVeiculo = {
      placa: '',
      modelo: '',
      tipo: 'VUC',
      capacidadeKg: 5000,
      capacidadeM3: 22,
      ano: new Date().getFullYear(),
      ativo: true
    };
    this.showModalCriar = true;
  }

  fecharModalCriar() {
    this.showModalCriar = false;
  }

  salvarNovoVeiculo() {
    if (!this.novoVeiculo.placa.trim() || !this.novoVeiculo.modelo.trim()) {
      this.notificationService.warning('Campos Obrigatórios', 'Preencha a Placa e o Modelo do veículo.');
      return;
    }

    this.isSubmitting.set(true);
    this.veiculoService.criar(this.novoVeiculo).subscribe({
      next: (criado) => {
        this.isSubmitting.set(false);
        this.fecharModalCriar();
        this.notificationService.success('Veículo Cadastrado!', `Placa: ${criado.placa} (${criado.modelo})`);
        this.veiculos.update(list => [criado, ...list]);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.notificationService.error('Erro', 'Falha ao salvar veículo.');
      }
    });
  }

  abrirDetalhes(v: Veiculo) {
    this.veiculoSelecionado = v;
    this.showModalDetalhes = true;
  }

  fecharDetalhes() {
    this.showModalDetalhes = false;
    this.veiculoSelecionado = null;
  }

  get veiculosFiltrados(): Veiculo[] {
    return this.veiculos().filter(v => {
      const matchTipo = this.filtroTipo === 'TODOS' || v.tipo === this.filtroTipo;
      const busca = this.termoBusca.toLowerCase().trim();
      const matchBusca = !busca || 
        v.placa.toLowerCase().includes(busca) ||
        v.modelo.toLowerCase().includes(busca) ||
        v.id.toLowerCase().includes(busca);
      return matchTipo && matchBusca;
    });
  }

  getContador(tipo: string): number {
    if (tipo === 'TODOS') return this.veiculos().length;
    return this.veiculos().filter(v => v.tipo === tipo).length;
  }
}
