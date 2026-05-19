import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Despesa {
  id: number;
  valor: number;
  data: string;
  categoria: string;
  recorrencia: string;
  tipo: 'fixa' | 'variavel';
}

@Component({
  selector: 'app-crud-despesas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-despesas.component.html',
  styleUrls: ['./crud-despesas.component.css']
})
export class CrudDespesasComponent {

  modalAberto = false;

  despesas: Despesa[] = [];

  novaDespesa: Despesa = {
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

  salvarDespesa() {

    const nova = {
      ...this.novaDespesa,
      id: Date.now()
    };

    this.despesas.push(nova);

    console.log(this.despesas);

    this.resetarFormulario();

    this.fecharModal();
  }

  editarDespesa(item: Despesa) {
    this.novaDespesa = { ...item };
    this.modalAberto = true;
  }

  excluirDespesa(id: number) {
    this.despesas = this.despesas.filter(x => x.id !== id);
  }

  resetarFormulario() {
    this.novaDespesa = {
      id: 0,
      valor: 0,
      data: '',
      categoria: '',
      recorrencia: 'Mensal',
      tipo: 'fixa'
    };
  }
}