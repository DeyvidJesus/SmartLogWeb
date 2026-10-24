import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, timer, exhaustMap, catchError, EMPTY } from 'rxjs';
import { DeliveryExperienceService } from '../../services/delivery-experience.service';
import { Occurrence, OCCURRENCE_TYPES } from '../../models/delivery-experience.model';
import { DeliveryOperationsComponent } from '../../components/delivery-operations/delivery-operations.component';
import { EntregaService } from '../../services/entrega.service';

@Component({
  selector: 'app-occurrences',
  standalone: true,
  imports: [CommonModule, FormsModule, DeliveryOperationsComponent],
  templateUrl: './occurrences.component.html',
  styleUrl: './occurrences.component.css',
})
export class OccurrencesComponent implements OnInit, OnDestroy {
  private readonly service = inject(DeliveryExperienceService);
  private readonly deliveries = inject(EntregaService);
  private subscription?: Subscription;
  private detail?: Subscription;
  readonly rows = signal<Occurrence[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly types = OCCURRENCE_TYPES;
  selectedId = '';
  hasReceipt = false;
  filter = 'ABERTA';
  ngOnInit() {
    this.subscription = timer(0, 15000)
      .pipe(
        exhaustMap(() =>
          this.service.allOccurrences().pipe(
            catchError(() => {
              this.error.set(
                'Não foi possível consultar as ocorrências. Tentaremos novamente em 15 segundos.',
              );
              this.loading.set(false);
              return EMPTY;
            }),
          ),
        ),
      )
      .subscribe((rows) => {
        this.rows.set(rows);
        this.loading.set(false);
        this.error.set('');
      });
  }
  get filtered() {
    return this.rows().filter((row) => this.filter === 'TODAS' || row.status === this.filter);
  }
  get pending() {
    return this.rows().filter((row) => row.status === 'ABERTA').length;
  }
  select(row: Occurrence) {
    this.detail?.unsubscribe();
    this.selectedId = '';
    this.hasReceipt = false;
    this.detail = this.deliveries.buscarPorId(row.entregaId).subscribe({
      next: (delivery) => {
        this.hasReceipt = !!delivery.comprovanteDisponivel;
        this.selectedId = delivery.id;
      },
      error: () => this.error.set('Não foi possível abrir esta entrega.'),
    });
  }
  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.detail?.unsubscribe();
  }
}
