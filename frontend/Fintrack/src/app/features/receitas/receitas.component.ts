import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ReceitaService } from './receita.service';
import { Receita } from './receita.model';

interface CategoriaFixa {
  nome: string;
  icone: string;
  cssClass: string;
  cor: string;
}

interface CategoriaUsuario {
  nome: string;
  icone: string;
}

type ReceitaForm = {
  id: number;
  descricao: string;
  fonte: string;
  valor: number | null;
  data: string;
  categoria: string;
  categoriaIcone: string;
  tipo: 'FIXA' | 'VARIÁVEL';
  recorrencia: string;
};

@Component({
  selector: 'app-receitas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './receitas.component.html',
  styleUrls: ['./receitas.component.css']
})
export class ReceitasComponent implements OnInit {

  searchQuery = '';
  paginaAtual = 1;
  itensPorPagina = 7;

  modalAberto = false;
  modoEdicao = false;
  formulario: ReceitaForm = this.formVazio();

  // ─── Filtro de Categoria (dropdown btn-filter) ───────────────────────────────
  dropdownCategoriasAberto = false;
  categoriaSelecionada = '';

  toggleDropdownCategorias(): void {
    this.dropdownCategoriasAberto = !this.dropdownCategoriasAberto;
  }

  fecharDropdownCategorias(): void {
    this.dropdownCategoriasAberto = false;
  }

  filtrarPorCategoria(nome: string): void {
    this.categoriaSelecionada = this.categoriaSelecionada === nome ? '' : nome;
    this.dropdownCategoriasAberto = false;
    this.paginaAtual = 1;
  }

  limparFiltroCategoria(): void {
    this.categoriaSelecionada = '';
    this.dropdownCategoriasAberto = false;
    this.paginaAtual = 1;
  }

  get categoriasUsadasNasReceitas(): string[] {
    const set = new Set(this.listaReceitas.map((r: any) => r.categoria).filter(Boolean));
    return Array.from(set);
  }

  contarReceitasPorCategoria(nome: string): number {
    return this.listaReceitas.filter((r: any) => r.categoria === nome).length;
  }

  // ─── Modal Gerenciar Categorias ──────────────────────────────────────────────
  modalCategoriasAberto = false;
  buscaCategoria = '';
  novaCategoriaNome = '';

  categoriasFixas: CategoriaFixa[] = [
    { nome: 'Trabalho',      icone: 'work',       cssClass: 'trabalho',      cor: 'primary'   },
    { nome: 'Serviços',      icone: 'code',        cssClass: 'servicos',      cor: 'secondary' },
    { nome: 'Investimentos', icone: 'show_chart',  cssClass: 'investimentos', cor: 'tertiary'  },
    { nome: 'Aluguel',       icone: 'home',        cssClass: 'aluguel',       cor: 'secondary' },
  ];

  categoriasUsuario: CategoriaUsuario[] = [];

  get todasCategorias(): { nome: string; icone: string; cor: string }[] {
    const fixas = this.categoriasFixas.map(c => ({ nome: c.nome, icone: c.icone, cor: c.cor }));
    const usuario = this.categoriasUsuario.map(c => ({ nome: c.nome, icone: c.icone, cor: 'primary' }));
    return [...fixas, ...usuario];
  }

  get categoriasFixasFiltradas(): CategoriaFixa[] {
    if (!this.buscaCategoria.trim()) return this.categoriasFixas;
    const q = this.buscaCategoria.toLowerCase();
    return this.categoriasFixas.filter(c => c.nome.toLowerCase().includes(q));
  }

  get categoriasUsuarioFiltradas(): CategoriaUsuario[] {
    if (!this.buscaCategoria.trim()) return this.categoriasUsuario;
    const q = this.buscaCategoria.toLowerCase();
    return this.categoriasUsuario.filter(c => c.nome.toLowerCase().includes(q));
  }

  abrirModalCategorias(): void  { this.modalCategoriasAberto = true; }
  fecharModalCategorias(): void {
    this.modalCategoriasAberto = false;
    this.buscaCategoria = '';
    this.novaCategoriaNome = '';
  }

  adicionarCategoria(): void {
    const nome = this.novaCategoriaNome.trim();
    if (!nome) return;
    this.categoriasUsuario.push({ nome, icone: 'category' });
    this.novaCategoriaNome = '';
  }

  excluirCategoria(index: number): void {
    this.categoriasUsuario.splice(index, 1);
  }

  // ─── Dados de exemplo ────────────────────────────────────────────────────────
  listaReceitas: any[] = [
    { id: 1, descricao: 'Salário Mensal',        fonte: 'TechCorp International',  valor: 8500,  data: '05 Out 2023', categoria: 'Trabalho',      categoriaIcone: 'work',       tipo: 'FIXA',     recorrencia: 'Todo dia 05'     },
    { id: 2, descricao: 'Venda de Freelance',    fonte: 'Projeto Dashboard Admin', valor: 3200,  data: '12 Out 2023', categoria: 'Serviços',      categoriaIcone: 'code',       tipo: 'VARIÁVEL', recorrencia: 'Única entrada'   },
    { id: 3, descricao: 'Dividendos FIIs',       fonte: 'Carteira de Ativos X',    valor: 1300,  data: '15 Out 2023', categoria: 'Investimentos', categoriaIcone: 'show_chart', tipo: 'FIXA',     recorrencia: 'Mensal variável' },
    { id: 4, descricao: 'Aluguel Imóvel Centro', fonte: 'Locatário: João Silva',   valor: 1250,  data: '10 Out 2023', categoria: 'Aluguel',       categoriaIcone: 'home',       tipo: 'FIXA',     recorrencia: 'Todo dia 10'     },
  ];

  constructor(private receitaService: ReceitaService) {}

  ngOnInit(): void {}

  // ─── Busca e paginação ───────────────────────────────────────────────────────
  get receitasFiltradas(): any[] {
    let lista = this.listaReceitas;
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      lista = lista.filter(r =>
        r.descricao.toLowerCase().includes(q) || r.fonte.toLowerCase().includes(q)
      );
    }
    if (this.categoriaSelecionada) {
      lista = lista.filter(r => r.categoria === this.categoriaSelecionada);
    }
    return lista;
  }

  get receitasPaginadas(): any[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.receitasFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  get totalItens(): number { return this.receitasFiltradas.length; }
  get totalPaginas(): number { return Math.max(1, Math.ceil(this.totalItens / this.itensPorPagina)); }
  get paginasArray(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  get inicioItem(): number { return this.totalItens === 0 ? 0 : (this.paginaAtual - 1) * this.itensPorPagina + 1; }
  get fimItem(): number { return Math.min(this.paginaAtual * this.itensPorPagina, this.totalItens); }

  get totalReceitas(): number { return this.listaReceitas.reduce((s, r) => s + r.valor, 0); }
  get totalFixas(): number     { return this.listaReceitas.filter(r => r.tipo === 'FIXA').reduce((s, r) => s + r.valor, 0); }
  get totalVariaveis(): number { return this.listaReceitas.filter(r => r.tipo === 'VARIÁVEL').reduce((s, r) => s + r.valor, 0); }

  irPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) this.paginaAtual = p;
  }

  // ─── Modal CRUD ──────────────────────────────────────────────────────────────
  formVazio(): ReceitaForm {
    return { id: 0, descricao: '', fonte: '', valor: null, data: '', categoria: '', categoriaIcone: '', tipo: 'FIXA', recorrencia: 'Todo dia 05' };
  }

  abrirModalNovaReceita(): void {
    this.formulario = this.formVazio();
    this.modoEdicao = false;
    this.modalAberto = true;
  }

  editarReceita(r: any): void {
    this.formulario = { ...r };
    this.modoEdicao = true;
    this.modalAberto = true;
  }

  excluirReceita(id: number): void {
    if (confirm('Deseja realmente excluir esta receita?')) {
      this.listaReceitas = this.listaReceitas.filter(r => r.id !== id);
      if (this.paginaAtual > this.totalPaginas) {
        this.paginaAtual = this.totalPaginas;
      }
    }
  }

  onCategoriaChange(): void {
    const cat = this.todasCategorias.find(c => c.nome === this.formulario.categoria);
    if (cat) this.formulario.categoriaIcone = cat.icone;
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.formulario = this.formVazio();
  }

  salvarReceita(): void {
    if (!this.formulario.descricao.trim() || !this.formulario.valor || !this.formulario.data || !this.formulario.categoria) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const cat = this.todasCategorias.find(c => c.nome === this.formulario.categoria);

    if (this.modoEdicao) {
      const idx = this.listaReceitas.findIndex(r => r.id === this.formulario.id);
      if (idx > -1) this.listaReceitas[idx] = {
        ...this.formulario,
        categoriaIcone: cat?.icone ?? 'category',
        recorrencia: this.formulario.tipo === 'FIXA' ? this.formulario.recorrencia : 'Única entrada',
      };
    } else {
      this.listaReceitas.push({
        ...this.formulario,
        id: Date.now(),
        valor: this.formulario.valor ?? 0,
        categoriaIcone: cat?.icone ?? 'category',
        recorrencia: this.formulario.tipo === 'FIXA' ? this.formulario.recorrencia : 'Única entrada',
      });
      this.paginaAtual = this.totalPaginas;
    }

    this.fecharModal();
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}