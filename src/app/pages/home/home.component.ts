import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardMetrics } from '../../models/dashboard.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  readonly metrics = signal<DashboardMetrics | null>(null);

  ngOnInit() {
    this.loadMetrics();
  }

  loadMetrics() {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.metrics.set(data.metrics);
      }
    });
  }

  scrollToFeatures(event: Event) {
    event.preventDefault();
    const el = document.getElementById('features-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
