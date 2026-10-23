import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({selector:'app-login',standalone:true,imports:[CommonModule,FormsModule,RouterLink],
template:`<main class="login-page"><form class="card login-card" (ngSubmit)="entrar()">
<a routerLink="/home" class="brand">Smart<span>Log</span></a>
<h1>Acesse sua operação</h1><p>Entre com a mesma conta administradora usada no aplicativo.</p>
<label for="email">E-mail</label><input id="email" name="email" type="email" class="form-control" [(ngModel)]="email" autocomplete="username" required>
<label for="password">Senha</label><input id="password" name="password" type="password" class="form-control" [(ngModel)]="password" autocomplete="current-password" required>
<p role="alert" *ngIf="error()" class="error">{{error()}}</p>
<button class="btn btn-orange" [disabled]="busy()">{{busy()?'Entrando…':'Entrar no painel'}}</button>
<a routerLink="/home">Voltar à apresentação</a></form></main>`,
styles:[`.login-page{min-height:100dvh;display:grid;place-items:center;background:#0f172a;padding:24px}.login-card{max-width:460px;width:100%;padding:40px;display:grid;gap:16px}.brand{font-size:32px;font-weight:800;color:#0f172a;text-decoration:none}.brand span{color:#ff6500}label{font-weight:600}.form-control{width:100%;padding:12px;border:1px solid #cbd5e1;border-radius:8px}.error{color:#b91c1c}p{color:#64748b}`]})
export class LoginComponent {
  private auth=inject(AuthService); private router=inject(Router);
  email='';password='';busy=signal(false);error=signal('');
  async entrar() { this.busy.set(true);this.error.set('');
    try { await this.auth.signIn(this.email.trim(),this.password);this.password='';await this.router.navigateByUrl('/admin/dashboard'); }
    catch(e) { this.error.set(e instanceof Error?e.message:'Falha ao entrar.'); } finally {this.busy.set(false);}
  }
}
