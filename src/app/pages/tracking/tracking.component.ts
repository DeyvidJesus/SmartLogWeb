import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, timer, switchMap, exhaustMap, catchError, of } from 'rxjs';
import { DeliveryExperienceService } from '../../services/delivery-experience.service';
import { Tracking, OCCURRENCE_TYPES } from '../../models/delivery-experience.model';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tracking.component.html',
  styleUrl: './tracking.component.css',
})
export class TrackingComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(DeliveryExperienceService);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private subscription?: Subscription;
  readonly data = signal<Tracking | null>(null);
  readonly error = signal('');
  readonly loading = signal(true);
  readonly types = OCCURRENCE_TYPES;
  readonly statuses: Record<string, string> = {
    PENDENTE: 'Preparando sua entrega',
    EM_ROTA: 'Sua entrega está em rota',
    ENTREGUE: 'Entrega concluída',
    ATRASADA: 'Entrega com atraso',
    CANCELADA: 'Entrega cancelada',
  };
  readonly windows: Record<string, string> = {
    MANHA: 'Manhã',
    TARDE: 'Tarde',
    NOITE: 'Noite',
    COMERCIAL: 'Horário comercial',
  };
  ngOnInit() {
    this.title.setTitle('Acompanhe sua entrega | SmartLog');
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    this.meta.updateTag({ name: 'referrer', content: 'no-referrer' });
    this.subscription = this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.loading.set(true);
          this.data.set(null);
          this.error.set('');
          return timer(0, 20000).pipe(
            exhaustMap(() =>
              this.service.tracking(params.get('token') || '').pipe(
                catchError((error) => {
                  this.data.set(null);
                  this.error.set(
                    error.status === 404
                      ? 'Este link expirou ou foi revogado. Solicite um novo à loja ou transportadora.'
                      : 'Não foi possível atualizar sua entrega. Verifique a conexão. Tentaremos novamente em instantes.',
                  );
                  return of(null);
                }),
              ),
            ),
          );
        }),
      )
      .subscribe((data) => {
        this.data.set(data);
        this.loading.set(false);
        if (data) this.error.set('');
      });
  }
  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.meta.removeTag('name="robots"');
    this.meta.removeTag('name="referrer"');
  }
}
