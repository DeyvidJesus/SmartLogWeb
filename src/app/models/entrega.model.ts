export type EntregaStatus =
  'PENDENTE' | 'EM_ROTA' | 'EM_TRANSITO' | 'ATRASADA' | 'ENTREGUE' | 'CANCELADA';
export type JanelaEntrega = 'MANHA' | 'TARDE' | 'NOITE' | 'COMERCIAL';

export interface Entrega {
  id: string;
  codigo: string;
  empresaId: string;
  clienteId: string;
  rotaId: string;
  motoristaId: string | null;
  status: EntregaStatus;
  origem: string;
  destino: string;
  chaveNfe?: string;
  valorNfe?: number;
  pesoKg?: number;
  volumeM3?: number;
  volumes?: number;
  janelaEntrega?: JanelaEntrega;
  criadaEm: string;
  atualizadaEm: string;
  recebedor?: string | null;
  observacaoEntrega?: string | null;
  entregueEm?: string | null;
  confirmadoPorNome?: string | null;
  comprovanteDisponivel?: boolean;
  rastreamentoAtivo?: boolean;
  historicoStatus?: {
    status: string;
    em: string;
    responsavel: string;
    recebedor?: string;
    observacao?: string;
  }[];
}

export interface CriarEntregaRequest {
  clienteId: string;
  rotaId: string;
  origem: string;
  destino: string;
  chaveNfe?: string;
  valorNfe?: number;
  pesoKg?: number;
  volumeM3?: number;
  volumes?: number;
  janelaEntrega?: JanelaEntrega;
}

export interface AtualizarStatusRequest {
  status: EntregaStatus;
  recebedor?: string;
  observacaoEntrega?: string;
}

export interface EntregaListResponse {
  data: Entrega[];
}
