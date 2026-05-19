import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
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

  nomeUsuario = 'João Silva';
  dataAtual = '';

  saldoFinal = 5240.50;
  receitasMes = 3100.00;
  despesasMes = 1859.50;

  meses: MesData[] = [
    { label: 'Jan', receita: 60, despesa: 40 },
    { label: 'Fev', receita: 75, despesa: 55 },
    { label: 'Mar', receita: 50, despesa: 30 },
    { label: 'Abr', receita: 90, despesa: 70 },
    { label: 'Mai', receita: 65, despesa: 45 },
    { label: 'Jun', receita: 80, despesa: 60 },
    { label: 'Jul', receita: 55, despesa: 45 },
  ];

  get primeiroNome(): string {
    return this.nomeUsuario.split(' ')[0];
  }

  ngOnInit(): void {
    this.dataAtual = new Date().toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}