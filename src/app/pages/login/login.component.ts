import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BrandComponent } from '../../components/brand/brand.component';
import { IconComponent } from '../../components/icon/icon.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BrandComponent, IconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = '';
  password = '';
  busy = signal(false);
  error = signal('');
  async entrar() {
    this.busy.set(true);
    this.error.set('');
    try {
      await this.auth.signIn(this.email.trim(), this.password);
      this.password = '';
      await this.router.navigateByUrl('/admin/dashboard');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Falha ao entrar.');
    } finally {
      this.busy.set(false);
    }
  }
}
