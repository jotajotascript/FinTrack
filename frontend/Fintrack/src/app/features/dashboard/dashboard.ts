import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { ResumoService } from '../../core/services/resumo.service';

interface MesData {
  label: string;
  receita: number;
  despesa: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private resumoService = inject(ResumoService);

  nomeUsuario = '';
  dataAtual = '';
  saldoFinal = 0;
  receitasMes = 0;
  despesasMes = 0;
  carregando = true;
  meses: MesData[] = [];

  get primeiroNome(): string {
    return this.nomeUsuario.split(' ')[0];
  }

  async ngOnInit(): Promise<void> {
    this.dataAtual = new Date().toLocaleDateString('pt-BR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    this.nomeUsuario = this.authService.getNomeUsuario() ?? 'Usuário';
    await this.carregarResumoMesAtual();
    await this.carregarGrafico();
    this.carregando = false;
  }

  private async carregarResumoMesAtual(): Promise<void> {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      .toISOString().split('T')[0];
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
      .toISOString().split('T')[0];

    try {
      const resumo = await this.resumoService.getResumo(inicio, fim);
      this.saldoFinal = resumo.saldoFinal;
      this.receitasMes = resumo.totalReceitas;
      this.despesasMes = resumo.totalDespesas;
    } catch (err) {
      console.error('Erro ao carregar resumo:', err);
    }
  }

  private async carregarGrafico(): Promise<void> {
    const hoje = new Date();
    const labels = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul',
                    'Ago','Set','Out','Nov','Dez'];
    const resultados: MesData[] = [];

    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const inicio = new Date(data.getFullYear(), data.getMonth(), 1)
        .toISOString().split('T')[0];
      const fim = new Date(data.getFullYear(), data.getMonth() + 1, 0)
        .toISOString().split('T')[0];

      try {
        const resumo = await this.resumoService.getResumo(inicio, fim);
        resultados.push({
          label: labels[data.getMonth()],
          receita: Number(resumo.totalReceitas),
          despesa: Number(resumo.totalDespesas),
        });
      } catch {
        resultados.push({ label: labels[data.getMonth()], receita: 0, despesa: 0 });
      }
    }

    const maxVal = Math.max(...resultados.flatMap(m => [m.receita, m.despesa]), 1);
    this.meses = resultados.map(m => ({
      label: m.label,
      receita: Math.round((m.receita / maxVal) * 100),
      despesa: Math.round((m.despesa / maxVal) * 100),
    }));
  }
}