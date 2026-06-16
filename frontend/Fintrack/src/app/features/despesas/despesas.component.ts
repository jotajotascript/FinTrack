import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

import {
  DespesaService,
  Despesa,
  DespesaRequest,
  CategoriaEnum,
  RecorrenciaEnum,
  TipoSubclasse,
} from './despesa.service';
import { AuthService } from '../../core/services/auth';

interface CategoriaFixa {
  nome: string;
  icone: string;
  cssClass: string;
  cor: string;
  valor: string;
}

interface CategoriaUsuario {
  nome: string;
  icone: string;
}

type DespesaForm = {
  id: string;
  descricao: string;
  valorDespesa: number | null;
  dataVencimento: string;
  categoria: string;
  tipoSubclasse: TipoSubclasse | '';
  recorrencia: RecorrenciaEnum;
  tipo: 'FIXA' | 'VARIÁVEL';
};

@Component({
  selector: 'app-despesas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './despesas.component.html',
  styleUrls: ['./despesas.component.css']
})
export class DespesasComponent implements OnInit {

  listaDespesas: Despesa[] = [];
  nomeUsuario = '';
  carregando = false;
  erro: string | null = null;

  searchQuery = '';
  paginaAtual = 1;
  itensPorPagina = 7;

  modalAberto = false;
  modoEdicao = false;
  formulario: DespesaForm = this.formVazio();

  // ─── Filtro de Categoria ─────────────────────────────────────────────────────
  dropdownCategoriasAberto = false;
  categoriaSelecionada = '';
  categoriasUsadasNasDespesas: string[] = [];

  // ─── Modal Gerenciar Categorias ──────────────────────────────────────────────
  modalCategoriasAberto = false;
  buscaCategoria = '';
  novaCategoriaNome = '';
  categoriaEmEdicao: number | null = null;
  categoriaEdicaoNome = '';

  categoriasFixas: CategoriaFixa[] = [
    { nome: 'Alimentação', icone: 'restaurant',     cssClass: 'alimentacao', cor: 'primary',   valor: 'ALIMENTACAO' },
    { nome: 'Transporte',  icone: 'directions_car', cssClass: 'transporte',  cor: 'secondary', valor: 'TRANSPORTE'  },
    { nome: 'Saúde',       icone: 'favorite',       cssClass: 'saude',       cor: 'tertiary',  valor: 'SAUDE'       },
    { nome: 'Educação',    icone: 'school',         cssClass: 'educacao',    cor: 'primary',   valor: 'EDUCACAO'    },
    { nome: 'Lazer',       icone: 'beach_access',   cssClass: 'lazer',       cor: 'secondary', valor: 'LAZER'       },
    { nome: 'Outros',      icone: 'category',       cssClass: 'outros',      cor: 'tertiary',  valor: 'OUTROS'      },
  ];

  categoriasUsuario: CategoriaUsuario[] = [];

  constructor(
    private despesaService: DespesaService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    this.nomeUsuario = this.authService.getNomeUsuario() ?? 'Usuário';
    this.carregarCategoriasStorage();
    this.carregarDespesas();
    if (this.route.snapshot.queryParamMap.get('novo') === 'true') {
      this.abrirModalNovaDespesa();
    }
  }

  // ─── Categorias ──────────────────────────────────────────────────────────────

  get todasCategorias(): { nome: string; icone: string; cor: string; valor: string }[] {
    const fixas = this.categoriasFixas.map(c => ({
      nome: c.nome,
      icone: c.icone,
      cor: c.cor,
      valor: c.valor
    }));
    const usuario = this.categoriasUsuario.map(c => ({
      nome: c.nome,
      icone: c.icone,
      cor: 'secondary',
      valor: c.nome
    }));
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

  private readonly STORAGE_KEY = 'fintrack_categorias_despesas';

  private salvarCategoriasStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.categoriasUsuario));
  }

  private carregarCategoriasStorage(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try { this.categoriasUsuario = JSON.parse(saved); } catch { }
    }
  }

  adicionarCategoria(): void {
    const nome = this.novaCategoriaNome.trim();
    if (!nome) return;
    this.categoriasUsuario.push({ nome, icone: 'category' });
    this.salvarCategoriasStorage();
    this.novaCategoriaNome = '';
  }

  excluirCategoria(index: number): void {
    this.categoriasUsuario.splice(index, 1);
    this.salvarCategoriasStorage();
  }

  iniciarEdicaoCategoria(index: number): void {
    // O índice recebido é relativo à lista filtrada; precisamos encontrar o índice real
    const cat = this.categoriasUsuarioFiltradas[index];
    const indexReal = this.categoriasUsuario.findIndex(c => c === cat);
    this.categoriaEmEdicao = indexReal;
    this.categoriaEdicaoNome = cat.nome;
  }

  confirmarEdicaoCategoria(): void {
    const nome = this.categoriaEdicaoNome.trim();
    if (nome && this.categoriaEmEdicao !== null) {
      this.categoriasUsuario[this.categoriaEmEdicao].nome = nome;
      this.salvarCategoriasStorage();
    }
    this.cancelarEdicaoCategoria();
  }

  cancelarEdicaoCategoria(): void {
    this.categoriaEmEdicao = null;
    this.categoriaEdicaoNome = '';
  }

  // ─── Filtro de Categoria ─────────────────────────────────────────────────────

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

  atualizarCategoriasUsadas(): void {
    const set = new Set(this.listaDespesas.map(d => this.extrairCategoriaReal(d)).filter(Boolean));
    this.categoriasUsadasNasDespesas = Array.from(set);
  }

  contarDespesasPorCategoria(nome: string): number {
    return this.listaDespesas.filter(d => this.extrairCategoriaReal(d) === nome).length;
  }

  // ─── Carregar despesas ───────────────────────────────────────────────────────

  carregarDespesas(): void {
    this.erro = null;
    this.despesaService.listarDespesas().subscribe({
      next: (dados: Despesa[]) => {
        this.listaDespesas = dados;
        this.atualizarCategoriasUsadas();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        this.erro = 'Não foi possível carregar as despesas. Tente novamente.';
        this.cdr.detectChanges();
      }
    });
  }

  // ─── Busca e paginação ───────────────────────────────────────────────────────

  get despesasFiltradas(): Despesa[] {
    let lista = this.listaDespesas;
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      lista = lista.filter(d =>
        this.extrairDescricaoReal(d).toLowerCase().includes(q) ||
        d.tipoSubclasse?.toLowerCase().includes(q)
      );
    }
    if (this.categoriaSelecionada) {
      lista = lista.filter(d => this.extrairCategoriaReal(d) === this.categoriaSelecionada);
    }
    return lista;
  }

  get despesasPaginadas(): Despesa[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.despesasFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  get totalItens(): number { return this.despesasFiltradas.length; }
  get totalPaginas(): number { return Math.max(1, Math.ceil(this.totalItens / this.itensPorPagina)); }
  get paginasArray(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  get inicioItem(): number { return this.totalItens === 0 ? 0 : (this.paginaAtual - 1) * this.itensPorPagina + 1; }
  get fimItem(): number { return Math.min(this.paginaAtual * this.itensPorPagina, this.totalItens); }

  get totalDespesas(): number  { return this.listaDespesas.reduce((s, d) => s + Number(d.valorDespesa), 0); }
  get totalFixas(): number     { return this.listaDespesas.filter(d => d.tipoSubclasse === 'FIXA').reduce((s, d) => s + Number(d.valorDespesa), 0); }
  get totalVariaveis(): number { return this.listaDespesas.filter(d => d.tipoSubclasse === 'VARIAVEL').reduce((s, d) => s + Number(d.valorDespesa), 0); }

  irPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) this.paginaAtual = p;
  }

  // ─── Modal CRUD ──────────────────────────────────────────────────────────────

  formVazio(): DespesaForm {
    return {
      id: '',
      descricao: '',
      valorDespesa: null,
      dataVencimento: '',
      categoria: '',
      tipoSubclasse: 'FIXA',
      recorrencia: 'MENSAL',
      tipo: 'FIXA',
    };
  }

  abrirModalNovaDespesa(): void {
    this.formulario = this.formVazio();
    this.modoEdicao = false;
    this.modalAberto = true;
  }

  onTipoChange(tipo: 'FIXA' | 'VARIÁVEL'): void {
    this.formulario.tipo = tipo;
    if (tipo === 'VARIÁVEL') {
      this.formulario.tipoSubclasse = 'VARIAVEL';
      this.formulario.recorrencia = 'ANUAL';
    } else {
      this.formulario.tipoSubclasse = 'FIXA';
      this.formulario.recorrencia = 'MENSAL';
    }
  }

  editarDespesa(d: Despesa): void {
    this.formulario = {
      id: d.id,
      descricao: this.extrairDescricaoReal(d),
      tipoSubclasse: d.tipoSubclasse as TipoSubclasse,
      valorDespesa: Number(d.valorDespesa),
      dataVencimento: d.dataVencimento,
      categoria: this.extrairCategoriaReal(d),
      tipo: d.tipoSubclasse === 'FIXA' ? 'FIXA' : 'VARIÁVEL',
      recorrencia: (d.recorrencia ?? 'MENSAL') as RecorrenciaEnum,
    };
    this.modoEdicao = true;
    this.modalAberto = true;
  }

  excluirDespesa(id: string): void {
    if (!confirm('Deseja realmente excluir esta despesa?')) return;
    this.despesaService.excluirDespesa(id).subscribe({
      next: () => {
        this.listaDespesas = this.listaDespesas.filter(d => d.id !== id);
        this.updatesPosAcao();
      },
      error: (err: any) => {
        console.error(err);
        alert('Erro ao excluir despesa. Tente novamente.');
      }
    });
  }

  private updatesPosAcao(): void {
    this.atualizarCategoriasUsadas();
    if (this.paginaAtual > this.totalPaginas) {
      this.paginaAtual = this.totalPaginas;
    }
    this.cdr.detectChanges();
  }

  onCategoriaChange(): void {}

  fecharModal(): void {
    this.modalAberto = false;
    this.formulario = this.formVazio();
  }

  bloquearScroll(event: WheelEvent): void {
    (event.target as HTMLInputElement).blur();
  }

  salvarDespesa(): void {
    if (
      !this.formulario.descricao.trim() ||
      !this.formulario.valorDespesa ||
      !this.formulario.dataVencimento ||
      !this.formulario.categoria
    ) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const enumsAceitosPeloJava = ['ALIMENTACAO', 'TRANSPORTE', 'SAUDE', 'EDUCACAO', 'LAZER', 'OUTROS'];
    const ehCustomizada = !enumsAceitosPeloJava.includes(this.formulario.categoria);

    const categoriaFinalDTO = (ehCustomizada ? 'OUTROS' : this.formulario.categoria) as CategoriaEnum;

    const descricaoFinalDTO = ehCustomizada
      ? `${this.formulario.descricao.trim()}::[${this.formulario.categoria}]`
      : this.formulario.descricao.trim();

    const dto: DespesaRequest = {
      descricao: descricaoFinalDTO,
      valorDespesa: Number(this.formulario.valorDespesa),
      dataVencimento: this.formulario.dataVencimento,
      categoria: categoriaFinalDTO,
      tipoSubclasse: this.formulario.tipoSubclasse as TipoSubclasse,
      recorrencia: this.formulario.tipoSubclasse === 'FIXA' ? this.formulario.recorrencia : undefined
    };

    const requisicao = this.modoEdicao
      ? this.despesaService.atualizarDespesa(this.formulario.id, dto)
      : this.despesaService.salvarDespesa(dto);

    requisicao.subscribe({
      next: (resultado: Despesa) => {
        if (this.modoEdicao) {
          const idx = this.listaDespesas.findIndex(d => d.id === this.formulario.id);
          if (idx > -1) this.listaDespesas[idx] = resultado;
        } else {
          this.listaDespesas.push(resultado);
          this.paginaAtual = this.totalPaginas;
        }
        this.updatesPosAcao();
        this.fecharModal();
      },
      error: (err: any) => {
        console.error(err);
        alert('Erro ao salvar despesa. Tente novamente.');
      }
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  extrairDescricaoReal(d: Despesa): string {
    if (!d.descricao) return '';
    if (d.descricao.includes('::[')) {
      return d.descricao.split('::[')[0];
    }
    return d.descricao;
  }

  extrairCategoriaReal(d: Despesa): string {
    if (d.descricao && d.descricao.includes('::[')) {
      const partes = d.descricao.split('::[');
      if (partes[1]) {
        return partes[1].replace(']', '');
      }
    }
    return d.categoria;
  }

  formatarValor(valor: number): string {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  iconeCategoria(cat: string): string {
    return this.todasCategorias.find(c => c.valor === cat)?.icone ?? 'category';
  }

  nomeCategoriaExibicao(cat: string): string {
    if (!cat) return 'Categorias';
    const mapa: Record<string, string> = {
      ALIMENTACAO: 'Alimentação',
      TRANSPORTE: 'Transporte',
      SAUDE: 'Saúde',
      EDUCACAO: 'Educação',
      LAZER: 'Lazer',
      OUTROS: 'Outros'
    };
    return mapa[cat] ?? cat;
  }
}