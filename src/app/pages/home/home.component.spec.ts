import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { HomeComponent } from './home.component';

describe('Landing page pública', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'home', component: HomeComponent }])],
    }),
  );

  it('apresenta o produto sem serviços autenticados e mantém as âncoras na URL atual', async () => {
    const harness = await RouterTestingHarness.create('/home?origem=teste');
    const page = harness.routeNativeElement!;
    expect(page.querySelector('h1')?.textContent).toContain('Sua operação');
    expect(page.querySelector('a[appSectionLink="plataforma"]')?.getAttribute('href')).toBe(
      '/home?origem=teste#plataforma',
    );
    expect(page.textContent).toContain('Prévia com dados ilustrativos');
  });

  it('restaura a aba por URL e permite explorar as respostas ilustrativas sem rede', async () => {
    const harness = await RouterTestingHarness.create('/home?visao=assistente');
    const page = harness.routeNativeElement!;
    expect(page.querySelector('[aria-selected="true"]')?.textContent).toContain('Assistente IA');
    const prompts = page.querySelectorAll<HTMLButtonElement>('.sample-prompts button');
    prompts[1].click();
    harness.detectChanges();
    expect(page.querySelector('.sample-ai-message')?.textContent).toContain('ENT-002');
    expect(prompts[1].getAttribute('aria-pressed')).toBe('true');
    expect(page.querySelector('.sample-ai-message')?.textContent).toContain('sem consulta à IA');
  });

  it('troca de aba pelo teclado e mantém parâmetros de origem', async () => {
    const harness = await RouterTestingHarness.create('/home?origem=teste');
    const page = harness.routeNativeElement!;
    page
      .querySelector('[role="tab"]')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/home?origem=teste&visao=rotas');
    expect(page.querySelector('[aria-selected="true"]')?.textContent).toContain('Entregas e rotas');
    expect(page.querySelector('#preview-panel-rotas')?.hasAttribute('hidden')).toBe(false);
  });
});
