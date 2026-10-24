export interface Rota {
  id: string;
  nome: string;
  observacoes?: string | null;
  motoristaId: string | null;
  localizacaoAtual?: {latitude: number; longitude: number; atualizadoEm: string | null} | null;
  status?: string;
  distanciaRestanteMetros?: number | null;
  distanciaCalculadaEm?: string | null;
  distanciaIncluiGps?: boolean;
  entregas?: string[];
  criadaEm?: string;
  atualizadaEm?: string;
}
