import { Component, Input, OnChanges, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, timer, exhaustMap, forkJoin, catchError, EMPTY } from 'rxjs';
import { EntregaService } from '../../services/entrega.service';
import { DeliveryExperienceService } from '../../services/delivery-experience.service';
import { Receipt, Occurrence, OCCURRENCE_TYPES } from '../../models/delivery-experience.model';

@Component({
  selector: 'app-delivery-operations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-operations.component.html',
  styleUrl: './delivery-operations.component.css',
})
export class DeliveryOperationsComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) deliveryId = '';
  @Input() hasReceipt = false;
  private readonly service = inject(DeliveryExperienceService);
  private readonly deliveries = inject(EntregaService);
  private polling?: Subscription;
  private requests = new Subscription();
  readonly occurrences = signal<Occurrence[]>([]);
  readonly receipt = signal<Receipt | null>(null);
  readonly error = signal('');
  readonly message = signal('');
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly types = OCCURRENCE_TYPES;
  selected: Occurrence | null = null;
  resolution = '';
  customerMessage = '';
  shareUrl = '';
  expires = '';

  ngOnChanges() {
    this.polling?.unsubscribe();
    this.requests.unsubscribe();
    this.requests = new Subscription();
    this.occurrences.set([]);
    this.receipt.set(null);
    this.error.set('');
    this.selected = null;
    this.shareUrl = '';
    this.message.set('');
    this.loading.set(true);
    this.busy.set(false);
    this.polling = timer(0, 15000)
      .pipe(
        exhaustMap(() =>
          forkJoin({
            rows: this.service.occurrences(this.deliveryId),
            delivery: this.deliveries.buscarPorId(this.deliveryId),
          }).pipe(
            catchError(() => {
              this.error.set(
                'Não foi possível atualizar a entrega. Tentaremos novamente em 15 segundos.',
              );
              this.loading.set(false);
              return EMPTY;
            }),
          ),
        ),
      )
      .subscribe({
        next: ({ rows, delivery }) => {
          this.occurrences.set(rows);
          this.loading.set(false);
          this.error.set('');
          if (delivery.comprovanteDisponivel && !this.receipt())
            this.requests.add(
              this.service.receipt(this.deliveryId).subscribe({
                next: (row) => this.receipt.set(row),
                error: () => this.error.set('Não foi possível carregar o comprovante.'),
              }),
            );
        },
      });
  }
  ngOnDestroy() {
    this.polling?.unsubscribe();
    this.requests.unsubscribe();
  }
  refresh() {
    this.ngOnChanges();
  }
  inspect(row: Occurrence) {
    this.selected = row;
    this.resolution = '';
    this.customerMessage = row.mensagemCliente || '';
    if (row.temFoto)
      this.requests.add(
        this.service.occurrence(this.deliveryId, row.docId).subscribe({
          next: (full) => {
            if (this.selected?.docId === full.docId) this.selected = full;
          },
          error: () => this.error.set('Não foi possível carregar a foto da ocorrência.'),
        }),
      );
  }
  resolve() {
    if (!this.selected || !this.resolution.trim() || !this.customerMessage.trim() || this.busy())
      return;
    this.busy.set(true);
    this.error.set('');
    this.requests.add(
      this.service
        .resolve(this.deliveryId, this.selected.docId, this.resolution, this.customerMessage)
        .subscribe({
          next: (row) => {
            this.occurrences.update((rows) => rows.map((r) => (r.docId === row.docId ? row : r)));
            this.selected = row;
            this.busy.set(false);
            this.message.set('Ocorrência resolvida e acompanhamento atualizado.');
          },
          error: (err) => {
            this.busy.set(false);
            this.error.set(err.error?.message || 'Falha ao resolver ocorrência.');
          },
        }),
    );
  }
  share() {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.requests.add(
      this.service.share(this.deliveryId).subscribe({
        next: (row) => {
          this.shareUrl = new URL(row.caminho, window.location.origin).href;
          this.expires = row.expiraEm;
          this.busy.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Falha ao criar link.');
          this.busy.set(false);
        },
      }),
    );
  }
  revoke() {
    if (this.busy()) return;
    this.busy.set(true);
    this.requests.add(
      this.service.revoke(this.deliveryId).subscribe({
        next: () => {
          this.shareUrl = '';
          this.message.set('Links anteriores revogados.');
          this.busy.set(false);
        },
        error: () => {
          this.error.set('Falha ao revogar link.');
          this.busy.set(false);
        },
      }),
    );
  }
  printReceipt() {
    window.print();
  }
}
