import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  DespesaService,
  Despesa,
  DespesaRequest,
  CategoriaEnum,
  RecorrenciaEnum,
  TipoSubclasse,
} from './despesa.service';
 
// Mapeamento visual das categorias do backend para exibição amigável
interface CategoriaInfo {
  valor: CategoriaEnum;
  label: string;
  icone: string;
  cor: string;
}

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
 
type DespesaForm = {
  id: string;
  descricao: string;
  valorDespesa: number | null;
  dataVencimento: string;
  categoria: CategoriaEnum | '';
  tipoSubclasse: TipoSubclasse | '';
  recorrencia: RecorrenciaEnum;
};
 
@Component({
  selector: 'app-despesas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './despesas.component.html',
  styleUrls: ['./despesas.component.css'],
})
export class DespesasComponent implements OnInit {
 
  listaDespesas: Despesa[] = [];
  carregando = false;
  erro: string | null = null;
 
  constructor(private despesaService: DespesaService, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}
 
  ngOnInit(): void {
    this.carregarDespesasDoServidor();
    if (this.route.snapshot.queryParamMap.get('novo') === 'true') {
      this.abrirModalNovaDespesa();
    }
  }
 
  // ─── Modal Gerenciar Categorias ──────────────────────────────────────────────

  modalCategoriasAberto = false;
  buscaCategoria = '';
  novaCategoriaNome = '';

  categoriasFixas: CategoriaFixa[] = [
    { nome: 'Alimentação',   icone: 'restaurant',     cssClass: 'alimentacao',   cor: 'tertiary',  valor: 'ALIMENTACAO' },
    { nome: 'Lazer',         icone: 'theaters',        cssClass: 'lazer',         cor: 'secondary', valor: 'LAZER'       },
    { nome: 'Saúde',         icone: 'favorite',        cssClass: 'saude',         cor: 'primary',   valor: 'SAUDE'       },
    { nome: 'Transporte',    icone: 'directions_car',  cssClass: 'transporte',    cor: 'primary',   valor: 'TRANSPORTE'  },
    { nome: 'Salário',       icone: 'payments',        cssClass: 'trabalho',      cor: 'secondary', valor: 'SALARIO'     },
    { nome: 'Outros',        icone: 'category',        cssClass: 'outros',        cor: 'secondary', valor: 'OUTROS'      },
  ];

  categoriasUsuario: CategoriaUsuario[] = [];

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

  abrirModalCategorias(): void { this.modalCategoriasAberto = true; }
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

  // ─── Integração com o Backend ────────────────────────────────────────────────

  refreshing = false;

  refreshDespesas(): void {
    this.refreshing = true;
    this.erro = null;
    this.despesaService.listarDespesas().subscribe({
      next: (dados) => { this.listaDespesas = dados; this.refreshing = false; this.cdr.detectChanges(); },
      error: (err) => { console.error(err); this.erro = 'Não foi possível recarregar as despesas.'; this.refreshing = false; this.cdr.detectChanges(); }
    });
  }

  carregarDespesasDoServidor(): void {
    this.erro = null;
    this.despesaService.listarDespesas().subscribe({
      next: (dados) => {
        this.listaDespesas = dados;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.erro = 'Não foi possível carregar as despesas do servidor.';
        this.cdr.detectChanges();
      }
    });
  }
 
  // ─── Mapeamento visual das categorias do backend ──────────────────────────────
 
  readonly categorias: CategoriaInfo[] = [
    { valor: 'ALIMENTACAO', label: 'Alimentação', icone: 'restaurant',    cor: 'tertiary'  },
    { valor: 'LAZER',       label: 'Lazer',       icone: 'theaters',       cor: 'secondary' },
    { valor: 'SAUDE',       label: 'Saúde',       icone: 'favorite',       cor: 'primary'   },
    { valor: 'TRANSPORTE',  label: 'Transporte',  icone: 'directions_car', cor: 'primary'   },
    { valor: 'SALARIO',     label: 'Salário',     icone: 'payments',       cor: 'secondary' },
    { valor: 'OUTROS',      label: 'Outros',      icone: 'category',       cor: 'secondary' },
  ];
 
  readonly recorrencias: RecorrenciaEnum[] = ['MENSAL', 'SEMANAL', 'ANUAL'];
 
  getCategoriaInfo(valor: CategoriaEnum): CategoriaInfo {
    return this.categorias.find(c => c.valor === valor) ?? {
      valor,
      label: valor,
      icone: 'category',
      cor: 'secondary',
    };
  }
 
  getCategoriaBadge(cor: string): string {
    const map: Record<string, string> = {
      secondary: 'categoria-secondary',
      tertiary:  'categoria-tertiary',
      primary:   'categoria-primary',
    };
    return map[cor] ?? 'categoria-secondary';
  }
 
  // ─── Métricas dos Stats Cards ──────────────────────────────────────────────
 
  get totalDespesasMes(): number {
    return this.despesasFiltradas.reduce((acc, d) => acc + Number(d.valorDespesa ?? 0), 0);
  }
 
  get totalFixas(): number {
    return this.despesasFiltradas
      .filter(d => d.tipoSubclasse === 'FIXA')
      .reduce((acc, d) => acc + Number(d.valorDespesa ?? 0), 0);
  }
 
  get totalVariaveis(): number {
    return this.despesasFiltradas
      .filter(d => d.tipoSubclasse === 'VARIAVEL')
      .reduce((acc, d) => acc + Number(d.valorDespesa ?? 0), 0);
  }
 
  // ─── Busca e Paginação ───────────────────────────────────────────────────────
 
  searchQuery = '';
  paginaAtual = 1;
  itensPorPagina = 7;
 
  get totalDespesas(): number {
    return this.despesasFiltradas.length;
  }
 
  get despesasFiltradas(): Despesa[] {
    let lista = this.listaDespesas;
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      lista = lista.filter(d =>
        d.descricao?.toLowerCase().includes(q) ||
        d.categoria?.toLowerCase().includes(q)
      );
    }
    if (this.categoriaSelecionada) {
      lista = lista.filter(d => d.categoria === this.categoriaSelecionada);
    }
    return lista;
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
 
  // ─── Filtro de Categoria ─────────────────────────────────────────────────────
 
  dropdownCategoriasAberto = false;
  categoriaSelecionada: CategoriaEnum | '' = '';
 
  toggleDropdownCategorias(): void {
    this.dropdownCategoriasAberto = !this.dropdownCategoriasAberto;
  }
 
  fecharDropdownCategorias(): void {
    this.dropdownCategoriasAberto = false;
  }
 
  filtrarPorCategoria(valor: CategoriaEnum): void {
    this.categoriaSelecionada = this.categoriaSelecionada === valor ? '' : valor;
    this.dropdownCategoriasAberto = false;
    this.paginaAtual = 1;
  }
 
  limparFiltroCategoria(): void {
    this.categoriaSelecionada = '';
    this.dropdownCategoriasAberto = false;
    this.paginaAtual = 1;
  }
 
  get categoriasUsadasNasDespesas(): CategoriaEnum[] {
    return [...new Set(this.listaDespesas.map(d => d.categoria).filter(Boolean))];
  }
 
  contarDespesasPorCategoria(valor: CategoriaEnum): number {
    return this.listaDespesas.filter(d => d.categoria === valor).length;
  }
 
  // ─── Modal CRUD de Despesas ──────────────────────────────────────────────────
 
  modalCrudAberto = false;
  modoEdicao = false;
  formulario: DespesaForm = this.formVazio();
 
  formVazio(): DespesaForm {
    return {
      id: '',
      descricao: '',
      valorDespesa: null,
      dataVencimento: '',
      categoria: '',
      tipoSubclasse: '',
      recorrencia: 'MENSAL',
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
      descricao:      d.descricao ?? '',
      valorDespesa:   Number(d.valorDespesa),
      dataVencimento: d.dataVencimento ?? '',
      categoria:      d.categoria,
      tipoSubclasse:  d.tipoSubclasse,
      recorrencia:    d.recorrencia ?? 'MENSAL',
    };
    this.modoEdicao = true;
    this.modalCrudAberto = true;
  }
 
  excluirDespesa(id: string): void {
    if (confirm('Deseja realmente excluir esta despesa?')) {
      this.despesaService.excluirDespesa(id).subscribe({
        next: () => {
          this.carregarDespesasDoServidor();
          if (this.paginaAtual > this.totalPaginas) {
            this.paginaAtual = this.totalPaginas;
          }
        },
        error: (err) => {
          console.error(err);
          alert('Erro ao excluir despesa do servidor.');
        }
      });
    }
  }
 
  fecharModalCrud(): void {
    this.modalCrudAberto = false;
    this.formulario = this.formVazio();
  }
 
  salvarDespesa(): void {
    if (
      !this.formulario.descricao.trim() ||
      !this.formulario.valorDespesa ||
      !this.formulario.dataVencimento ||
      !this.formulario.categoria ||
      !this.formulario.tipoSubclasse
    ) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
 
    const payload: DespesaRequest = {
      descricao:      this.formulario.descricao.trim(),
      valorDespesa:   this.formulario.valorDespesa,
      dataVencimento: this.formulario.dataVencimento,
      categoria:      this.formulario.categoria as CategoriaEnum,
      tipoSubclasse:  this.formulario.tipoSubclasse as TipoSubclasse,
      recorrencia:    this.formulario.tipoSubclasse === 'FIXA' ? this.formulario.recorrencia : undefined,
    };
 
    const requisicao = this.modoEdicao
      ? this.despesaService.atualizarDespesa(this.formulario.id, payload)
      : this.despesaService.salvarDespesa(payload);
 
    requisicao.subscribe({
      next: () => {
        this.fecharModalCrud();
        this.carregarDespesasDoServidor();
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao processar requisição no servidor.');
      }
    });
  }
}