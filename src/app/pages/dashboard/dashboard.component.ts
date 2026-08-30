import { Component, OnInit, AfterViewInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { DashboardService } from '../../services/dashboard.service';
import { NotificationService } from '../../services/notification.service';
import { DashboardMetrics, AlertaOperacional } from '../../models/dashboard.model';
import { Entrega, EntregaStatus } from '../../models/entrega.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly notificationService = inject(NotificationService);

  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly metrics = signal<DashboardMetrics | null>(null);
  readonly entregasRecentes = signal<Entrega[]>([]);
  readonly ultimaAtualizacao = signal<Date>(new Date());

  entregaSelecionada: Entrega | null = null;
  showModalDetalhes: boolean = false;

  private map: L.Map | null = null;

  ngOnInit() {
    this.carregarDados();
  }

  ngAfterViewInit() {
    // Inicializar mapa após renderização da DOM
    setTimeout(() => this.initMap(), 300);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  carregarDados() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.metrics.set(data.metrics);
        this.entregasRecentes.set(data.entregasRecentes);
        this.ultimaAtualizacao.set(new Date());
        this.isLoading.set(false);
        setTimeout(() => this.updateMapMarkers(), 400);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os dados analíticos da Torre de Controle.');
        this.isLoading.set(false);
        this.notificationService.error('Erro no Dashboard', 'Falha ao carregar indicadores operacionais.');
      }
    });
  }

  private initMap() {
    const mapContainer = document.getElementById('operational-map');
    if (!mapContainer || this.map) return;

    // Centro em São Paulo - Hub Logístico Principal
    this.map = L.map('operational-map', {
      center: [-23.5505, -46.6333],
      zoom: 11,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(this.map);

    this.updateMapMarkers();
  }

  private updateMapMarkers() {
    if (!this.map) return;

    // CD Central Smart Res / SmartLog Hub
    const cdIcon = L.divIcon({
      className: 'custom-cd-marker',
      html: '<div class="cd-pin">🏢 CD Central</div>',
      iconSize: [100, 30],
      iconAnchor: [50, 15]
    });

    L.marker([-23.5280, -46.6870], { icon: cdIcon })
      .addTo(this.map)
      .bindPopup('<b>CD Central SmartLog (São Paulo)</b><br>Capacidade: 45.000m³ • 18 docas ativas');

    // Frotas e Caminhões em Trânsito
    const truckLocations = [
      { id: 'BRA2E19', lat: -23.5615, lng: -46.6559, status: 'Em Rota • Av. Paulista', motorista: 'Carlos Silva' },
      { id: 'LOG8X44', lat: -22.9056, lng: -47.0608, status: 'Em Deslocamento • Campinas', motorista: 'Marcos Oliveira' },
      { id: 'SLG9A01', lat: -23.9618, lng: -46.3322, status: 'Entregando • Santos', motorista: 'Equipe Express' },
      { id: 'CAR7B22', lat: -23.4969, lng: -46.4422, status: 'Em Rota • Zona Leste', motorista: 'Frota Pesada' }
    ];

    truckLocations.forEach(truck => {
      const truckIcon = L.divIcon({
        className: 'custom-truck-marker',
        html: `<div class="truck-pin">🚚 ${truck.id}</div>`,
        iconSize: [90, 26],
        iconAnchor: [45, 13]
      });

      L.marker([truck.lat, truck.lng], { icon: truckIcon })
        .addTo(this.map!)
        .bindPopup(`<b>Veículo ${truck.id}</b><br>Condutor: ${truck.motorista}<br>Status: ${truck.status}`);
    });

    // Traçar Rota de Distribuição (Polylines)
    const rota1Coords: L.LatLngExpression[] = [
      [-23.5280, -46.6870], // CD
      [-23.5505, -46.6333], // Centro
      [-23.5615, -46.6559]  // Av Paulista
    ];

    L.polyline(rota1Coords, { color: '#FF6500', weight: 4, opacity: 0.8, dashArray: '6, 8' }).addTo(this.map);
  }

  abrirModalDetalhes(entrega: Entrega) {
    this.entregaSelecionada = entrega;
    this.showModalDetalhes = true;
  }

  fecharModalDetalhes() {
    this.showModalDetalhes = false;
    this.entregaSelecionada = null;
  }

  getStatusClass(status: EntregaStatus): string {
    switch (status) {
      case 'PENDENTE': return 'badge-pendente';
      case 'EM_ROTA':
      case 'EM_TRANSITO': return 'badge-transito';
      case 'ENTREGUE': return 'badge-entregue';
      case 'CANCELADA': return 'badge-cancelada';
      default: return '';
    }
  }

  getStatusLabel(status: EntregaStatus): string {
    switch (status) {
      case 'PENDENTE': return 'Pendente';
      case 'EM_ROTA': return 'Em Rota';
      case 'EM_TRANSITO': return 'Em Trânsito';
      case 'ENTREGUE': return 'Entregue';
      case 'CANCELADA': return 'Cancelada';
      default: return status;
    }
  }

  getPercentual(valor: number, total: number): number {
    if (!total || total === 0) return 0;
    return Math.round((valor / total) * 100);
  }
}
