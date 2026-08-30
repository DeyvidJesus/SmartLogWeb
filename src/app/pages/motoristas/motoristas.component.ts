import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MotoristaService } from '../../services/motorista.service';
import { NotificationService } from '../../services/notification.service';
import { Motorista } from '../../models/motorista.model';

@Component({
  selector: 'app-motoristas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './motoristas.component.html',
  styleUrl: './motoristas.component.css'
})
export class MotoristasComponent implements OnInit {
  private readonly motoristaService = inject(MotoristaService);
  private readonly notificationService = inject(NotificationService);

  readonly motoristas = signal<Motorista[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isSubmitting = signal<boolean>(false);

  termoBusca: string = '';
  filtroStatus: string = 'TODOS';

  motoristaSelecionado: Motorista | null = null;
  showModalDetalhes: boolean = false;
  showModalCriar: boolean = false;

  novoMotorista = {
    nome: '',
    email: '',
    uid: '',
    ativo: true
  };

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.isLoading.set(true);
    this.motoristaService.listar().subscribe({
      next: (data) => {
        this.motoristas.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  abrirModalCriar() {
    this.novoMotorista = {
      nome: '',
      email: '',
      uid: 'uid-mot-' + Math.floor(100 + Math.random() * 900),
      ativo: true
    };
    this.showModalCriar = true;
  }

  fecharModalCriar() {
    this.showModalCriar = false;
  }

  salvarNovoMotorista() {
    if (!this.novoMotorista.nome.trim() || !this.novoMotorista.email.trim()) {
      this.notificationService.warning('Aviso', 'Preencha o Nome e E-mail.');
      return;
    }

    this.isSubmitting.set(true);
    this.motoristaService.criar(this.novoMotorista).subscribe({
      next: (criado) => {
        this.isSubmitting.set(false);
        this.fecharModalCriar();
        this.notificationService.success('Motorista Cadastrado!', criado.nome);
        this.motoristas.update(m => [criado, ...m]);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.notificationService.error('Erro', 'Falha ao cadastrar motorista.');
      }
    });
  }

  abrirDetalhes(m: Motorista) {
    this.motoristaSelecionado = m;
    this.showModalDetalhes = true;
  }

  fecharDetalhes() {
    this.showModalDetalhes = false;
    this.motoristaSelecionado = null;
  }

  get motoristasFiltrados(): Motorista[] {
    return this.motoristas().filter(m => {
      const matchStatus = this.filtroStatus === 'TODOS' || 
        (this.filtroStatus === 'ATIVOS' && m.ativo) ||
        (this.filtroStatus === 'INATIVOS' && !m.ativo);
      
      const busca = this.termoBusca.toLowerCase().trim();
      const matchBusca = !busca || 
        m.nome.toLowerCase().includes(busca) ||
        m.email.toLowerCase().includes(busca) ||
        m.id.toLowerCase().includes(busca);

      return matchStatus && matchBusca;
    });
  }

  getContador(status: string): number {
    if (status === 'TODOS') return this.motoristas().length;
    if (status === 'ATIVOS') return this.motoristas().filter(m => m.ativo).length;
    if (status === 'INATIVOS') return this.motoristas().filter(m => !m.ativo).length;
    return 0;
  }
}
