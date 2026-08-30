export type TipoVeiculo = 'VUC' | 'TOCO' | 'TRUCK' | 'VAN' | 'CARRETA';

export interface Veiculo {
  id: string;
  empresaId: string;
  placa: string;
  modelo: string;
  tipo: TipoVeiculo;
  capacidadeKg: number;
  capacidadeM3: number;
  ano: number;
  ativo: boolean;
  criadaEm: string;
  atualizadaEm: string;
}

export interface CriarVeiculoRequest {
  placa: string;
  modelo: string;
  tipo: TipoVeiculo;
  capacidadeKg: number;
  capacidadeM3: number;
  ano: number;
  ativo: boolean;
}
