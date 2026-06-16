import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

import { ReceitaService } from './receita.service';
import { AuthService } from '../../core/services/auth';
import { Receita, ReceitaRequest, CategoriaEnum, RecorrenciaEnum } from './receita.model';

interface CategoriaFixa {
  nome: string;
  icone: string;
  cssClass: string;
  cor: string;
  valor: CategoriaEnum;
}

interface CategoriaUsuario {
  nome: string;
  icone: string;
}

type ReceitaForm = {
  id: string;
  descricao: string;
  tipoSubclasse: string;
  valorReceita: number | null;
  dataRecebimento: string;
  categoria: string;
  categoriaIcone: string;
  tipo: 'FIXA' | 'VARIÁVEL';
  recorrencia: RecorrenciaEnum;
};

@Component({
  selector: 'app-receitas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './receitas.component.html',
  styleUrls: ['./receitas.component.css']
})
export class ReceitasComponent implements OnInit {

  nomeUsuario = '';
  searchQuery = '';
  paginaAtual = 1;
  itensPorPagina = 7;

  modalAberto = false;
  modoEdicao = false;
  formulario: ReceitaForm = this.formVazio();

  erro: string | null = null;

  // ─── Filtro de Categoria ─────────────────────────────────────────────────────
  dropdownCategoriasAberto = false;
  categoriaSelecionada: string = '';
  categoriasUsadasNasReceitas: string[] = [];

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
    const set = new Set(this.listaReceitas.map(r => this.extrairCategoriaReal(r)).filter(Boolean));
    this.categoriasUsadasNasReceitas = Array.from(set);
  }

  contarReceitasPorCategoria(nome: string): number {
    return this.listaReceitas.filter(r => this.extrairCategoriaReal(r) === nome).length;
  }

  // ─── Modal Gerenciar Categorias ──────────────────────────────────────────────
  modalCategoriasAberto = false;
  buscaCategoria = '';
  novaCategoriaNome = '';

  categoriasFixas: CategoriaFixa[] = [
    { nome: 'Salário',     icone: 'work',          cssClass: 'trabalho',    cor: 'primary',   valor: 'SALARIO'     },
    { nome: 'Alimentação', icone: 'restaurant',     cssClass: 'alimentacao', cor: 'secondary', valor: 'ALIMENTACAO' },
    { nome: 'Saúde',       icone: 'favorite',       cssClass: 'saude',       cor: 'tertiary',  valor: 'SAUDE'       },
    { nome: 'Transporte',  icone: 'directions_car', cssClass: 'transporte',  cor: 'secondary', valor: 'TRANSPORTE'  },
    { nome: 'Lazer',       icone: 'beach_access',   cssClass: 'lazer',       cor: 'primary',   valor: 'LAZER'       },
    { nome: 'Outros',      icone: 'category',       cssClass: 'outros',      cor: 'secondary', valor: 'OUTROS'       },
  ];

  categoriasUsuario: CategoriaUsuario[] = [];

  get todasCategorias(): { nome: string; icone: string; cor: string; valor: string }[] {
    const fixas = this.categoriasFixas.map(c => ({
      nome: c.nome,
      icone: c.icone,
      cor: c.cor,
      valor: c.valor as string
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

  private readonly STORAGE_KEY = 'fintrack_categorias_receitas';

  private salvarCategoriasStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.categoriasUsuario));
  }

  private carregarCategoriasStorage(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try { this.categoriasUsuario = JSON.parse(saved); } catch { }
    }
  }

  bloquearScroll(event: WheelEvent): void {
    (event.target as HTMLInputElement).blur();
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

  categoriaEmEdicao: number | null = null;
  categoriaEdicaoNome = '';

  iniciarEdicaoCategoria(index: number): void {
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

  // ─── Lista de receitas ───────────────────────────────────────────────────────
  listaReceitas: Receita[] = [];

  constructor(
    private receitaService: ReceitaService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
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

  ngOnInit(): void {
    this.nomeUsuario = this.authService.getNomeUsuario() ?? 'Usuário';
    this.carregarCategoriasStorage();
    this.carregarReceitas();
    if (this.route.snapshot.queryParamMap.get('novo') === 'true') {
      setTimeout(() => this.abrirModalNovaReceita(), 0);
    }
  }

  carregarReceitas(): void {
    this.erro = null;
    this.receitaService.listar().subscribe({
      next: (dados) => {
        this.listaReceitas = dados;
        this.atualizarCategoriasUsadas();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.erro = 'Não foi possível carregar as receitas. Tente novamente.';
        this.cdr.detectChanges();
      }
    });
  }

  // ─── Busca e paginação ───────────────────────────────────────────────────────
  get receitasFiltradas(): Receita[] {
    let lista = this.listaReceitas;
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      lista = lista.filter(r =>
        this.extrairDescricaoReal(r).toLowerCase().includes(q) ||
        r.tipoSubclasse?.toLowerCase().includes(q)
      );
    }
    if (this.categoriaSelecionada) {
      lista = lista.filter(r => this.extrairCategoriaReal(r) === this.categoriaSelecionada);
    }
    return lista;
  }

  get receitasPaginadas(): Receita[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.receitasFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  get totalItens(): number { return this.receitasFiltradas.length; }
  get totalPaginas(): number { return Math.max(1, Math.ceil(this.totalItens / this.itensPorPagina)); }
  get paginasArray(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  get inicioItem(): number { return this.totalItens === 0 ? 0 : (this.paginaAtual - 1) * this.itensPorPagina + 1; }
  get fimItem(): number { return Math.min(this.paginaAtual * this.itensPorPagina, this.totalItens); }

  get totalReceitas(): number { return this.listaReceitas.reduce((s, r) => s + Number(r.valorReceita), 0); }
  get totalFixas(): number     { return this.listaReceitas.filter(r => r.recorrencia !== 'ANUAL').reduce((s, r) => s + Number(r.valorReceita), 0); }
  get totalVariaveis(): number { return this.listaReceitas.filter(r => r.recorrencia === 'ANUAL').reduce((s, r) => s + Number(r.valorReceita), 0); }

  irPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) this.paginaAtual = p;
  }

  // ─── Modal CRUD ──────────────────────────────────────────────────────────────
  formVazio(): ReceitaForm {
    return {
      id: '',
      descricao: '',
      tipoSubclasse: 'FIXA', // valores aceitos pelo banco: 'FIXA' | 'VARIAVEL'
      valorReceita: null,
      dataRecebimento: '',
      categoria: '',
      categoriaIcone: '',
      tipo: 'FIXA',
      recorrencia: 'MENSAL'
    };
  }

  abrirModalNovaReceita(): void {
    this.formulario = this.formVazio();
    this.modoEdicao = false;
    this.modalAberto = true;
  }

  editarReceita(r: Receita): void {
    const tipoDisplay: 'FIXA' | 'VARIÁVEL' = (r.tipoSubclasse === 'VARIAVEL' || r.recorrencia === 'ANUAL') ? 'VARIÁVEL' : 'FIXA';
    this.formulario = {
      id: r.id,
      descricao: this.extrairDescricaoReal(r),
      tipoSubclasse: r.tipoSubclasse, // valor do banco: 'FIXA' ou 'VARIAVEL'
      valorReceita: Number(r.valorReceita),
      dataRecebimento: r.dataRecebimento,
      categoria: this.extrairCategoriaReal(r),
      categoriaIcone: this.todasCategorias.find(c => c.valor === this.extrairCategoriaReal(r))?.icone ?? 'category',
      tipo: tipoDisplay,
      recorrencia: r.recorrencia
    };
    this.modoEdicao = true;
    this.modalAberto = true;
  }

  excluirReceita(id: string): void {
    if (!confirm('Deseja realmente excluir esta receita?')) return;
    this.receitaService.deletar(id).subscribe({
      next: () => {
        this.listaReceitas = this.listaReceitas.filter(r => r.id !== id);
        this.atualizarCategoriasUsadas();
        if (this.paginaAtual > this.totalPaginas) {
          this.paginaAtual = this.totalPaginas;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao excluir receita. Tente novamente.');
      }
    });
  }

  onCategoriaChange(): void {
    const cat = this.todasCategorias.find(c => c.valor === this.formulario.categoria);
    if (cat) this.formulario.categoriaIcone = cat.icone;
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.formulario = this.formVazio();
  }

  salvarReceita(): void {
    if (
      !this.formulario.descricao.trim() ||
      !this.formulario.valorReceita ||
      !this.formulario.dataRecebimento ||
      !this.formulario.categoria
    ) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const enumsAceitosPeloJava = ['SALARIO', 'ALIMENTACAO', 'SAUDE', 'TRANSPORTE', 'LAZER', 'OUTROS'];
    const ehCustomizada = !enumsAceitosPeloJava.includes(this.formulario.categoria);
    
    const categoriaFinalDTO = ehCustomizada ? ('OUTROS' as CategoriaEnum) : (this.formulario.categoria as CategoriaEnum);
    
    // MÁGICA: Se for customizada, injetamos a tag "::[NomeDaCategoria]" no fim da descrição para recuperar depois
    const descricaoFinalDTO = ehCustomizada 
      ? `${this.formulario.descricao.trim()}::[${this.formulario.categoria}]`
      : this.formulario.descricao.trim();

    const dto: ReceitaRequest = {
      descricao: descricaoFinalDTO,
      valorReceita: Number(this.formulario.valorReceita),
      dataRecebimento: this.formulario.dataRecebimento,
      categoria: categoriaFinalDTO,
      tipoSubclasse: this.formulario.tipo === 'VARIÁVEL' ? 'VARIAVEL' : 'FIXA',
      recorrencia: this.formulario.recorrencia
    };

    const requisicao = this.modoEdicao
      ? this.receitaService.atualizar(this.formulario.id, dto)
      : this.receitaService.criar(dto);

    requisicao.subscribe({
      next: (resultado) => {
        if (this.modoEdicao) {
          const idx = this.listaReceitas.findIndex(r => r.id === this.formulario.id);
          if (idx > -1) this.listaReceitas[idx] = resultado;
        } else {
          this.listaReceitas.push(resultado);
          this.paginaAtual = this.totalPaginas;
        }
        this.atualizarCategoriasUsadas();
        this.cdr.detectChanges();
        this.fecharModal();
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao salvar receita. Tente novamente.');
      }
    });
  }

  // ─── Métodos Extratores de Tags Metadados ──────────────────────────────────────
  extrairDescricaoReal(r: Receita): string {
    if (!r.descricao) return '';
    if (r.descricao.includes('::[')) {
      return r.descricao.split('::[')[0];
    }
    return r.descricao;
  }

  extrairCategoriaReal(r: Receita): string {
    if (r.descricao && r.descricao.includes('::[')) {
      const partes = r.descricao.split('::[');
      if (partes[1]) {
        return partes[1].replace(']', ''); // Retorna o nome limpo, ex: "Freelance"
      }
    }
    return r.categoria;
  }

  // ─── Helpers Atualizados para Renderização Dinâmica ─────────────────────────────
  formatarValor(valor: number): string {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  iconeCategoria(cat: string): string {
    return this.todasCategorias.find(c => c.valor === cat)?.icone ?? 'category';
  }

  nomeCategoriaExibicao(cat: string): string {
    if (!cat) return 'Categorias';
    const mapa: Record<string, string> = {
      SALARIO: 'Salário',
      ALIMENTACAO: 'Alimentação',
      SAUDE: 'Saúde',
      TRANSPORTE: 'Transporte',
      LAZER: 'Lazer',
      OUTROS: 'Outros'
    };
    return mapa[cat] ?? cat;
  }
}