import { IconComponent } from '../icon/icon.component';
import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BrandComponent } from '../brand/brand.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [IconComponent, CommonModule, RouterLink, BrandComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly menuOpen = input(false);
  readonly menuToggle = output<void>();
  readonly initials = computed(
    () =>
      this.authService
        .currentUser()
        .nome.trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((name) => name.charAt(0))
        .join('')
        .toUpperCase() || 'AD',
  );

  logout() {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
