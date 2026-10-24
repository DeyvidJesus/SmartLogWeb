import { SectionLinkDirective } from '../../directives/section-link.directive';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { BrandComponent } from '../../components/brand/brand.component';
import { IconComponent } from '../../components/icon/icon.component';
import { LandingHeroComponent } from '../../components/landing-hero/landing-hero.component';
import { PlatformPreviewComponent } from '../../components/platform-preview/platform-preview.component';
import { AppShowcaseComponent } from '../../components/app-showcase/app-showcase.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    SectionLinkDirective,
    RouterLink,
    BrandComponent,
    IconComponent,
    LandingHeroComponent,
    PlatformPreviewComponent,
    AppShowcaseComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);
  readonly year = new Date().getFullYear();
  readonly questions = [
    {
      question: 'Como o painel se conecta ao aplicativo?',
      answer:
        'O painel e o aplicativo compartilham os registros da operação. A gestão organiza entregas e rotas no painel; o motorista consulta suas atribuições e confirma mudanças de status pelo app. O painel consulta as atualizações a cada 5 segundos.',
    },
    {
      question: 'Quem pode usar o SmartLog?',
      answer:
        'O painel web é destinado aos administradores. No aplicativo Android, administradores, motoristas e clientes têm experiências próprias, com acesso às informações permitidas para cada perfil e empresa.',
    },
    {
      question: 'O que o assistente de IA pode responder?',
      answer:
        'Você pode fazer perguntas sobre entregas, status e a operação da sua empresa. O assistente usa os dados que seu perfil pode acessar e informa quando faltam dados para responder. A disponibilidade depende do serviço de IA e da conexão.',
    },
    {
      question: 'Como funciona a localização dos motoristas?',
      answer:
        'O mapa do painel mostra a última posição enviada pelo aplicativo, com o horário do registro. O motorista precisa permitir o acesso ao GPS e enviar sua posição. Sem esse envio, não há localização disponível.',
    },
  ];

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe(() => this.menuOpen.set(false));
  }

  closeMenu() {
    this.menuOpen.set(false);
    document.getElementById('site-menu-toggle')?.focus();
  }
}
