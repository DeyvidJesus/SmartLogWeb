import { IconComponent } from '../../components/icon/icon.component';
import { Component, OnInit, AfterViewInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { DashboardService } from '../../services/dashboard.service';
import { NotificationService } from '../../services/notification.service';
import { DashboardMetrics, AlertaOperacional } from '../../models/dashboard.model';
import { Entrega, EntregaStatus } from '../../models/entrega.model';
import { Rota } from '../../models/rota.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [IconComponent, CommonModule, RouterLink],
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
  private markers: L.LayerGroup | null = null;
  private requestInFlight = false;
  private refreshTimer?: ReturnType<typeof setInterval>;
  readonly rotas = signal<Rota[]>([]);

  ngOnInit() {
    this.carregarDados();
    this.refreshTimer = setInterval(() => { if (!this.isLoading()) this.carregarDados(); }, 5000);
  }

  ngAfterViewInit() {
    // Inicializar mapa após renderização da DOM
    setTimeout(() => this.initMap(), 300);
  }

  ngOnDestroy() {
    clearInterval(this.refreshTimer);
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  carregarDados() {
    if(this.requestInFlight) return;
    this.requestInFlight = true;
    if(!this.metrics()) this.isLoading.set(true);
    this.errorMessage.set(null);

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.metrics.set(data.metrics);
        this.rotas.set(data.rotas);
        this.entregasRecentes.set(data.entregasRecentes);
        this.ultimaAtualizacao.set(new Date());
        this.requestInFlight = false;
        this.isLoading.set(false);
        setTimeout(() => { this.initMap(); this.map?.invalidateSize(); this.updateMapMarkers(); }, 0);
      },
      error: () => {
        this.metrics.set(null);
        this.errorMessage.set('Não foi possível atualizar a operação. Verifique a conexão e tente novamente.');
        this.requestInFlight = false;
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
    if (!this.markers) this.markers = L.layerGroup().addTo(this.map);
    this.markers.clearLayers();
    const positions: L.LatLngExpression[] = [];
    for (const rota of this.rotas()) {
      const gps = rota.localizacaoAtual;
      if (!gps || !Number.isFinite(gps.latitude) || !Number.isFinite(gps.longitude)) continue;
      const point: L.LatLngExpression = [gps.latitude, gps.longitude];
      positions.push(point);
      const info = document.createElement('div');
      const time = gps.atualizadoEm ? new Date(gps.atualizadoEm).toLocaleString('pt-BR') : 'Horário não informado';
      info.textContent = `${rota.nome} — ${rota.status || 'Status não informado'} — GPS: ${time}`;
      const icon = L.divIcon({
        className: 'smartlog-map-pin',
        html: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40" aria-hidden="true"><path d="M16 1C8 1 2 7 2 15c0 10 14 23 14 23s14-13 14-23C30 7 24 1 16 1Z" fill="#FF6500" stroke="#fff" stroke-width="2"/><circle cx="16" cy="15" r="5" fill="#fff"/></svg>',
        iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -36],
      });
      L.marker(point, {icon, title: rota.nome, alt: 'Localização da rota ' + rota.nome})
        .addTo(this.markers).bindPopup(info);
    }
    if (positions.length) this.map.fitBounds(L.latLngBounds(positions), { maxZoom: 14, padding: [30, 30] });
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
      case 'ATRASADA':
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
      case 'ATRASADA': return 'Atrasada';
      case 'CANCELADA': return 'Cancelada';
      default: return status;
    }
  }

  getPercentual(valor: number, total: number): number {
    if (!total || total === 0) return 0;
    return Math.round((valor / total) * 100);
  }
}
