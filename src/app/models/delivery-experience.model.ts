export interface Receipt {
  recebedor: string;
  em: string;
  volumesRecebidos: number;
  fotos: string[];
  assinatura?: string;
  latitude?: number;
  longitude?: number;
  precisao?: number;
  observacao?: string;
  responsavel?: string;
}
export interface Occurrence {
  docId: string;
  entregaId: string;
  codigo: string;
  tipo: string;
  descricao: string;
  status: 'ABERTA' | 'RESOLVIDA';
  criadaEm: string;
  temFoto: boolean;
  foto?: string;
  volumesRecebidos?: number;
  responsavel: string;
  resolucao?: string;
  mensagemCliente?: string;
  resolvidaEm?: string;
  resolvidaPor?: string;
}
export interface Tracking {
  codigo: string;
  status: string;
  janelaEntrega: string | null;
  atualizadaEm: string;
  historico: { status: string; em: string }[];
  ocorrencias: {
    tipo: string;
    status: string;
    criadaEm: string;
    mensagem: string;
    resolvidaEm?: string;
  }[];
  comprovante: Receipt | null;
  expiraEm: string;
}
export const OCCURRENCE_TYPES: Record<string, string> = {
  AUSENTE: 'Destinatário ausente',
  AVARIA: 'Avaria',
  ENDERECO_INCORRETO: 'Endereço incorreto',
  RECUSA: 'Recusa',
  ENTREGA_PARCIAL: 'Entrega parcial',
  OUTRO: 'Outro motivo',
};
