import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DespesaService, Despesa } from './despesa.service';

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

type DespesaForm = {
  id: number;
  nome: string;
  descricao: string;
  valor: number | null;
  vencimento: string;
  categoria: string;
  categoriaIcone: string;
  categoriaCor: string;
  tipo: 'Fixa' | 'Variável';
  recorrencia: string;
};

@Component({
  selector: 'app-despesas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './despesas.component.html',
  styleUrls: ['./despesas.component.css'],
})
export class DespesasComponent implements OnInit {
  constructor(public despesaService: DespesaService) {}

  ngOnInit(): void {}

  // ─── Busca e paginação ───────────────────────────────────────────────────────
  searchQuery = '';
  paginaAtual = 1;
  itensPorPagina = 7;

  get totalDespesas(): number {
    return this.despesasFiltradas.length;
  }

  get despesas(): Despesa[] {
    return this.despesaService.despesas;
  }

  get despesasPaginadas(): Despesa[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.despesasFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.despesasFiltradas.length / this.itensPorPagina));
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get inicioItem(): number {
    return this.despesasFiltradas.length === 0 ? 0 : (this.paginaAtual - 1) * this.itensPorPagina + 1;
  }

  get fimItem(): number {
    return Math.min(this.paginaAtual * this.itensPorPagina, this.despesasFiltradas.length);
  }

  irPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) this.paginaAtual = p;
  }

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

  get despesasFiltradas(): Despesa[] {
    let lista = this.despesas;
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      lista = lista.filter(
        (d) => d.nome.toLowerCase().includes(q) || d.descricao.toLowerCase().includes(q),
      );
    }
    if (this.categoriaSelecionada) {
      lista = lista.filter(d => d.categoria === this.categoriaSelecionada);
    }
    return lista;
  }

  get categoriasUsadasNasDespesas(): string[] {
    const set = new Set(this.despesas.map(d => d.categoria).filter(Boolean));
    return Array.from(set);
  }

  // ─── Modal Gerenciar Categorias ──────────────────────────────────────────────
  modalCategoriasAberto = false;
  buscaCategoria = '';
  novaCategoriaNome = '';

  categoriasFixas: CategoriaFixa[] = [
    { nome: 'Alimentação', icone: 'restaurant',    cssClass: 'alimentacao', cor: 'tertiary'  },
    { nome: 'Moradia',     icone: 'home',           cssClass: 'moradia',     cor: 'secondary' },
    { nome: 'Transporte',  icone: 'directions_car', cssClass: 'transporte',  cor: 'primary'   },
    { nome: 'Lazer',       icone: 'theaters',       cssClass: 'lazer',       cor: 'secondary' },
    { nome: 'Saúde',       icone: 'favorite',       cssClass: 'saude',       cor: 'primary'   },
  ];

  categoriasUsuario: CategoriaUsuario[] = [
    { nome: 'Freelance',   icone: 'work'          },
    { nome: 'Assinaturas', icone: 'subscriptions' },
  ];

  get todasCategorias(): { nome: string; icone: string; cor: string }[] {
    const fixas = this.categoriasFixas.map(c => ({ nome: c.nome, icone: c.icone, cor: c.cor }));
    const usuario = this.categoriasUsuario.map(c => ({ nome: c.nome, icone: c.icone, cor: 'primary' }));
    return [...fixas, ...usuario];
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

  // ─── Modal CRUD de Despesas ──────────────────────────────────────────────────
  modalCrudAberto = false;
  modoEdicao = false;

  formulario: DespesaForm = this.formVazio();

  formVazio(): DespesaForm {
    return {
      id: 0,
      nome: '',
      descricao: '',
      valor: null,
      vencimento: '',
      categoria: '',
      categoriaIcone: '',
      categoriaCor: '',
      tipo: 'Fixa',
      recorrencia: 'Mensal',
    };
  }

  abrirModalNovaDespesa(): void {
    this.formulario = this.formVazio();
    this.modoEdicao = false;
    this.modalCrudAberto = true;
  }

  editarDespesa(d: Despesa): void {
    this.formulario = {
      id:             d.id,
      nome:           d.nome,
      descricao:      d.descricao,
      valor:          d.valor,
      vencimento:     d.vencimento,
      categoria:      d.categoria,
      categoriaIcone: d.categoriaIcone,
      categoriaCor:   d.categoriaCor,
      tipo:           d.tipo,
      recorrencia:    d.recorrencia ?? 'Mensal',
    };
    this.modoEdicao = true;
    this.modalCrudAberto = true;
  }

  excluirDespesa(id: number): void {
    if (confirm('Deseja realmente excluir esta despesa?')) {
      this.despesaService.excluir(id);
      if (this.paginaAtual > this.totalPaginas) {
        this.paginaAtual = this.totalPaginas;
      }
    }
  }

  onCategoriaChange(): void {
    const cat = this.todasCategorias.find(c => c.nome === this.formulario.categoria);
    if (cat) {
      this.formulario.categoriaIcone = cat.icone;
      this.formulario.categoriaCor   = cat.cor;
    }
  }

  fecharModalCrud(): void {
    this.modalCrudAberto = false;
    this.formulario = this.formVazio();
  }

  salvarDespesa(): void {
    if (!this.formulario.nome.trim() || !this.formulario.valor || !this.formulario.vencimento || !this.formulario.categoria) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const cat = this.todasCategorias.find(c => c.nome === this.formulario.categoria);

    const payload = {
      nome:           this.formulario.nome.trim(),
      descricao:      this.formulario.descricao.trim(),
      valor:          this.formulario.valor ?? 0,
      vencimento:     this.formulario.vencimento,
      vencido:        false,
      categoria:      this.formulario.categoria,
      categoriaIcone: cat?.icone ?? 'category',
      categoriaCor:   cat?.cor   ?? 'primary',
      tipo:           this.formulario.tipo,
      recorrencia:    this.formulario.tipo === 'Fixa' ? this.formulario.recorrencia : undefined,
    };

    if (this.modoEdicao) {
      this.despesaService.atualizar({ ...payload, id: this.formulario.id });
    } else {
      this.despesaService.adicionar(payload);
      // Ir para última página onde o item foi adicionado
      this.paginaAtual = this.totalPaginas;
    }

    this.fecharModalCrud();
  }

  contarDespesasPorCategoria(nome: string): number {
    return this.despesas.filter(d => d.categoria === nome).length;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  getCategoriaBadge(cor: string): string {
    const map: Record<string, string> = {
      secondary: 'categoria-secondary',
      tertiary:  'categoria-tertiary',
      primary:   'categoria-primary',
    };
    return map[cor] ?? 'categoria-secondary';
  }
}