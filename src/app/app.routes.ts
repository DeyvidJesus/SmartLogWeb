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
  { path: 'home', component: HomeComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'entregas', component: EntregasComponent },
      { path: 'veiculos', component: VeiculosComponent },
      { path: 'rotas', component: RotasComponent },
      { path: 'motoristas', component: MotoristasComponent },
      { path: 'clientes', component: ClientesComponent }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
