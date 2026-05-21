import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Receita {
  id: number;
  valor: number;
  data: string;
  categoria: string;
  recorrencia: string;
  tipo: 'fixa' | 'variavel';
}

@Component({
  selector: 'app-crud-receitas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-receitas.component.html',
  styleUrls: ['./crud-receitas.component.css']
})
export class CrudReceitasComponent {

  modalAberto = false;

  receitas: Receita[] = [];

  novaReceita: Receita = {
    id: 0,
    valor: 0,
    data: '',
    categoria: '',
    recorrencia: 'Mensal',
    tipo: 'fixa'
  };

  abrirModal() {
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  salvarReceita() {
    const nova = {
      ...this.novaReceita,
      id: Date.now()
    };

    this.receitas.push(nova);

    console.log(this.receitas);

    this.resetarFormulario();

    this.fecharModal();
  }

  editarReceita(item: Receita) {
    this.novaReceita = { ...item };
    this.modalAberto = true;
  }

  excluirReceita(id: number) {
    this.receitas = this.receitas.filter(x => x.id !== id);
  }

  resetarFormulario() {
    this.novaReceita = {
      id: 0,
      valor: 0,
      data: '',
      categoria: '',
      recorrencia: 'Mensal',
      tipo: 'fixa'
    };
  }
}