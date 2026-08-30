import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { CepService } from '../../services/cep.service';
import { NotificationService } from '../../services/notification.service';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly cepService = inject(CepService);
  private readonly notificationService = inject(NotificationService);

  readonly clientes = signal<Cliente[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isSubmitting = signal<boolean>(false);

  termoBusca: string = '';
  filtroStatus: string = 'TODOS';

  clienteSelecionado: Cliente | null = null;
  showModalDetalhes: boolean = false;
  showModalCriar: boolean = false;

  cepCliente: string = '';
  isBuscandoCep: boolean = false;

  novoCliente = {
    nome: '',
    email: '',
    telefone: '',
    ativo: true
  };

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.isLoading.set(true);
    this.clienteService.listar().subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  abrirModalCriar() {
    this.novoCliente = {
      nome: '',
      email: '',
      telefone: '119' + Math.floor(10000000 + Math.random() * 90000000),
      ativo: true
    };
    this.cepCliente = '';
    this.showModalCriar = true;
  }

  fecharModalCriar() {
    this.showModalCriar = false;
  }

  salvarNovoCliente() {
    if (!this.novoCliente.nome.trim() || !this.novoCliente.email.trim()) {
      this.notificationService.warning('Aviso', 'Preencha a Razão Social e E-mail.');
      return;
    }

    this.isSubmitting.set(true);
    this.clienteService.criar(this.novoCliente).subscribe({
      next: (criado) => {
        this.isSubmitting.set(false);
        this.fecharModalCriar();
        this.notificationService.success('Cliente Cadastrado!', criado.nome);
        this.clientes.update(c => [criado, ...c]);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.notificationService.error('Erro', 'Falha ao cadastrar cliente.');
      }
    });
  }

  abrirDetalhes(c: Cliente) {
    this.clienteSelecionado = c;
    this.showModalDetalhes = true;
  }

  fecharDetalhes() {
    this.showModalDetalhes = false;
    this.clienteSelecionado = null;
  }

  get clientesFiltrados(): Cliente[] {
    return this.clientes().filter(c => {
      const matchStatus = this.filtroStatus === 'TODOS' || 
        (this.filtroStatus === 'ATIVOS' && c.ativo) ||
        (this.filtroStatus === 'INATIVOS' && !c.ativo);
      
      const busca = this.termoBusca.toLowerCase().trim();
      const matchBusca = !busca || 
        c.nome.toLowerCase().includes(busca) ||
        c.email.toLowerCase().includes(busca) ||
        (c.telefone && c.telefone.includes(busca)) ||
        c.id.toLowerCase().includes(busca);

      return matchStatus && matchBusca;
    });
  }

  getContador(status: string): number {
    if (status === 'TODOS') return this.clientes().length;
    if (status === 'ATIVOS') return this.clientes().filter(c => c.ativo).length;
    if (status === 'INATIVOS') return this.clientes().filter(c => !c.ativo).length;
    return 0;
  }
}
