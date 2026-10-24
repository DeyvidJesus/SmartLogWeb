import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './pages/login/login.component';
import { AssistenteComponent } from './pages/assistente/assistente.component';
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EntregasComponent } from './pages/entregas/entregas.component';
import { VeiculosComponent } from './pages/veiculos/veiculos.component';
import { RotasComponent } from './pages/rotas/rotas.component';
import { MotoristasComponent } from './pages/motoristas/motoristas.component';
import { ClientesComponent } from './pages/clientes/clientes.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, title: 'Entrar no painel | SmartLog' },
  { path: 'home', component: HomeComponent, title: 'SmartLog — Sua operação na direção certa' },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [
      async () => {
        const auth = inject(AuthService);
        const router = inject(Router);
        if (!auth.isAuthenticated()) return router.createUrlTree(['/login']);
        try {
          await auth.loadProfile();
          return auth.isAdmin() || router.createUrlTree(['/login']);
        } catch {
          auth.logout();
          return router.createUrlTree(['/login']);
        }
      },
    ],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'assistente', component: AssistenteComponent, title: 'Assistente IA | SmartLog' },
      { path: 'dashboard', component: DashboardComponent, title: 'Visão da operação | SmartLog' },
      { path: 'entregas', component: EntregasComponent, title: 'Entregas | SmartLog' },
      { path: 'veiculos', component: VeiculosComponent, title: 'Frota e veículos | SmartLog' },
      { path: 'rotas', component: RotasComponent, title: 'Rotas | SmartLog' },
      { path: 'motoristas', component: MotoristasComponent, title: 'Motoristas | SmartLog' },
      { path: 'clientes', component: ClientesComponent, title: 'Clientes | SmartLog' },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
