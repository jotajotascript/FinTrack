import { Injectable } from '@angular/core';

export interface Despesa {
  id: number;
  nome: string;
  descricao: string;
  valor: number;
  vencimento: string;
  vencido: boolean;
  categoria: string;
  categoriaIcone: string;
  categoriaCor: string;
  tipo: 'Fixa' | 'Variável';
  recorrencia?: string;
}

@Injectable({ providedIn: 'root' })
export class DespesaService {
  despesas: Despesa[] = [
    {
      id: 1,
      nome: 'Aluguel Apartamento',
      descricao: 'Referente ao mês atual',
      valor: 1850.0,
      vencimento: '10/11/2023',
      vencido: false,
      categoria: 'Moradia',
      categoriaIcone: 'home',
      categoriaCor: 'secondary',
      tipo: 'Fixa',
      recorrencia: 'Mensal',
    },
    {
      id: 2,
      nome: 'Supermercado Pão de Açúcar',
      descricao: 'Compras da semana',
      valor: 425.5,
      vencimento: '05/11/2023',
      vencido: true,
      categoria: 'Alimentação',
      categoriaIcone: 'shopping_cart',
      categoriaCor: 'tertiary',
      tipo: 'Variável',
    },
    {
      id: 3,
      nome: 'Combustível Posto Ipiranga',
      descricao: 'Abastecimento viagem',
      valor: 210.0,
      vencimento: '12/11/2023',
      vencido: false,
      categoria: 'Transporte',
      categoriaIcone: 'directions_car',
      categoriaCor: 'primary',
      tipo: 'Variável',
    },
    {
      id: 4,
      nome: 'Assinatura Netflix + Disney',
      descricao: 'Streaming mensal',
      valor: 89.9,
      vencimento: '15/11/2023',
      vencido: false,
      categoria: 'Lazer',
      categoriaIcone: 'theaters',
      categoriaCor: 'secondary',
      tipo: 'Fixa',
      recorrencia: 'Mensal',
    },
  ];

  adicionar(d: Omit<Despesa, 'id'>): void {
    const id = Date.now();
    this.despesas.push({ ...d, id });
  }

  atualizar(d: Despesa): void {
    const idx = this.despesas.findIndex(x => x.id === d.id);
    if (idx !== -1) this.despesas[idx] = { ...d };
  }

  excluir(id: number): void {
    this.despesas = this.despesas.filter(x => x.id !== id);
  }
}