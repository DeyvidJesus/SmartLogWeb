export interface AlertaOperacional {
  id: string;
  tipo: 'CRITICO' | 'ALERTA' | 'INFO';
  titulo: string;
  descricao: string;
  tempo: string;
}

export interface DashboardMetrics {
  totalEntregas: number;
  pendentes: number;
  emTransito: number;
  entregues: number;
  canceladas: number;
  taxaSucesso: number;
  totalRotas: number;
  totalMotoristas: number;
  totalClientes: number;
  totalVeiculos: number;
  otifPercentual: number;
  slaCumprimentoPercentual: number;
  toneladasDespachadas: number;
  taxaOcupacaoFrota: number;
  alertas: AlertaOperacional[];
}
