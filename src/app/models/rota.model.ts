export interface Rota {
  id: string;
  nome: string;
  motoristaId: string | null;
  status?: string;
  entregas?: string[];
  criadaEm?: string;
  atualizadaEm?: string;
}
