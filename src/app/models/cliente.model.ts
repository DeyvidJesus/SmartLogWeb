export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
  criadaEm?: string;
  atualizadaEm?: string;
}
