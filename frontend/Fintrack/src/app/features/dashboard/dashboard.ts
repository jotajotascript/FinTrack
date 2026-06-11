import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { environment } from '../../../environments/environment';

interface MesData {
  label: string;
  receita: number;
  despesa: number;
}

export interface TransacaoResumo {
  id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  nomeUsuario = '';
  dataAtual = '';
  saldoFinal = 0;
  receitasMes = 0;
  despesasMes = 0;
  carregando = true;
  meses: MesData[] = [];
  transacoesRecentes: TransacaoResumo[] = [];

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  get primeiroNome(): string {
    return this.nomeUsuario.split(' ')[0];
  }

  async ngOnInit(): Promise<void> {
    this.dataAtual = new Date().toLocaleDateString('pt-BR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    this.nomeUsuario = this.authService.getNomeUsuario() ?? 'Usuário';
    try {
      await this.carregarDados();
    } catch (e) {
      console.error('[Dashboard] Erro geral:', e);
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  private async fetchSafe(url: string, headers: HeadersInit): Promise<any[]> {
    try {
      const r = await fetch(url, { headers });
      if (!r.ok) return [];
      return await r.json();
    } catch {
      return [];
    }
  }

  private async carregarDados(): Promise<void> {
    const token = this.authService.getToken();
    if (!token) return;

    const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };

    const [receitas, despesas] = await Promise.all([
      this.fetchSafe(`${environment.apiUrl}/receita`, headers),
      this.fetchSafe(`${environment.apiUrl}/despesa`, headers),
    ]);

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth();

    this.receitasMes = receitas
      .filter((r: any) => {
        const d = new Date(r.dataRecebimento);
        return d.getFullYear() === anoAtual && d.getMonth() === mesAtual;
      })
      .reduce((acc: number, r: any) => acc + Number(r.valorReceita ?? 0), 0);

    this.despesasMes = despesas
      .filter((d: any) => {
        const dt = new Date(d.dataVencimento);
        return dt.getFullYear() === anoAtual && dt.getMonth() === mesAtual;
      })
      .reduce((acc: number, d: any) => acc + Number(d.valorDespesa ?? 0), 0);

    this.saldoFinal = this.receitasMes - this.despesasMes;

    const listaReceitas: TransacaoResumo[] = receitas.map((r: any) => ({
      id: 'receita-' + r.id,
      tipo: 'receita' as const,
      descricao: r.descricao || 'Receita',
      valor: Number(r.valorReceita ?? 0),
      data: r.dataRecebimento,
      categoria: r.categoria || '',
    }));

    const listaDespesas: TransacaoResumo[] = despesas.map((d: any) => ({
      id: 'despesa-' + d.id,
      tipo: 'despesa' as const,
      descricao: d.descricao || 'Despesa',
      valor: Number(d.valorDespesa ?? 0),
      data: d.dataVencimento,
      categoria: d.categoria || '',
    }));

    this.transacoesRecentes = [...listaReceitas, ...listaDespesas]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 8);

    this.montarGrafico(receitas, despesas);
    this.cdr.detectChanges();
  }

  formatarCategoria(cat: string): string {
    const map: Record<string, string> = {
      ALIMENTACAO: 'Alimentação',
      LAZER: 'Lazer',
      SAUDE: 'Saúde',
      TRANSPORTE: 'Transporte',
      SALARIO: 'Salário',
      OUTROS: 'Outros',
    };
    return map[cat] ?? cat;
  }

  formatarData(iso: string): string {
    if (!iso) return '';
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  private montarGrafico(receitas: any[], despesas: any[]): void {
    const labels = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const hoje = new Date();
    const mesesData: MesData[] = [];

    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const ano = data.getFullYear();
      const mes = data.getMonth();

      const totalReceita = receitas
        .filter((r: any) => { const d = new Date(r.dataRecebimento); return d.getFullYear() === ano && d.getMonth() === mes; })
        .reduce((acc: number, r: any) => acc + Number(r.valorReceita ?? 0), 0);

      const totalDespesa = despesas
        .filter((d: any) => { const dt = new Date(d.dataVencimento); return dt.getFullYear() === ano && dt.getMonth() === mes; })
        .reduce((acc: number, d: any) => acc + Number(d.valorDespesa ?? 0), 0);

      mesesData.push({ label: labels[mes], receita: totalReceita, despesa: totalDespesa });
    }

    const maxVal = Math.max(...mesesData.flatMap(m => [m.receita, m.despesa]), 1);
    this.meses = mesesData.map(m => ({
      label: m.label,
      receita: Math.round((m.receita / maxVal) * 100),
      despesa: Math.round((m.despesa / maxVal) * 100),
    }));
  }
}