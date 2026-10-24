import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AssistantDemoComponent } from '../assistant-demo/assistant-demo.component';
import { IconComponent } from '../icon/icon.component';
import { RouteIllustrationComponent } from '../route-illustration/route-illustration.component';

type Preview = 'operacao' | 'rotas' | 'assistente';

@Component({
  selector: 'app-platform-preview',
  standalone: true,
  imports: [RouterLink, IconComponent, RouteIllustrationComponent, AssistantDemoComponent],
  templateUrl: './platform-preview.component.html',
  styleUrl: './platform-preview.component.css',
})
export class PlatformPreviewComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  readonly previewTabs = [
    { id: 'operacao' as const, label: 'Visão da operação', icon: 'chart' },
    { id: 'rotas' as const, label: 'Entregas e rotas', icon: 'map' },
    { id: 'assistente' as const, label: 'Assistente IA', icon: 'spark' },
  ];
  readonly activePreview = computed<Preview>(() => {
    const value = this.params().get('visao');
    return value === 'rotas' || value === 'assistente' ? value : 'operacao';
  });

  selectPreview(preview: Preview) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { visao: preview === 'operacao' ? null : preview },
      queryParamsHandling: 'merge',
      preserveFragment: true,
      replaceUrl: true,
    });
  }

  movePreview(event: KeyboardEvent, index: number) {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? 2
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + this.previewTabs.length) %
            this.previewTabs.length;
    this.selectPreview(this.previewTabs[next].id);
    document.getElementById(`preview-tab-${this.previewTabs[next].id}`)?.focus();
  }
}
