// Espelha exatamente o ReceitaResponseDTO do backend
export interface Receita {
  id: string;           // UUID
  usuarioId: string;    // UUID
  valorReceita: number;
  dataRecebimento: string; // ISO date: "YYYY-MM-DD"
  categoria: CategoriaEnum;
  tipoSubclasse: string;
  recorrencia: RecorrenciaEnum;
  descricao: string;
}

// Espelha o ReceitaRequestDTO do backend
export interface ReceitaRequest {
  valorReceita: number;
  dataRecebimento: string; // ISO date: "YYYY-MM-DD"
  categoria: CategoriaEnum;
  tipoSubclasse: string;
  recorrencia: RecorrenciaEnum;
  descricao: string;
}

export type CategoriaEnum =
  | 'ALIMENTACAO'
  | 'LAZER'
  | 'SAUDE'
  | 'TRANSPORTE'
  | 'SALARIO'
  | 'OUTROS';

export type RecorrenciaEnum = 'MENSAL' | 'SEMANAL' | 'ANUAL';