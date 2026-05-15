import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReceitaService } from './receita.service';
import { Receita } from './receita.model';

@Component({
  selector: 'app-receitas',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './receitas.component.html',
  styleUrls: ['./receitas.component.css']
})
export class ReceitasComponent {

  descricao = '';
  valor = 0;
  categoria = '';
  data = '';

  receitas: Receita[] = [];

  constructor(
    private receitaService: ReceitaService
  ) {}

  adicionarReceita() {

    const novaReceita: Receita = {

      id: Date.now(),

      descricao: this.descricao,

      valor: this.valor,

      categoria: this.categoria,

      data: this.data
    };

    this.receitaService.adicionar(novaReceita);

    this.receitas = this.receitaService.listar();

    this.limparFormulario();
  }

  excluirReceita(id: number) {

    this.receitaService.excluir(id);

    this.receitas = this.receitaService.listar();
  }

  limparFormulario() {

    this.descricao = '';

    this.valor = 0;

    this.categoria = '';

    this.data = '';
  }

}