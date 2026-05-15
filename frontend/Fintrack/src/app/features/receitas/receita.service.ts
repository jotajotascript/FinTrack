import { Injectable } from '@angular/core';
import { Receita } from './receita.model';

@Injectable({
  providedIn: 'root'
})
export class ReceitaService {

  receitas: Receita[] = [];

  adicionar(receita: Receita) {
    this.receitas.push(receita);
  }

  listar() {
    return this.receitas;
  }

  excluir(id: number) {
    this.receitas = this.receitas.filter(
      receita => receita.id !== id
    );
  }

  editar(receitaAtualizada: Receita) {

  const index = this.receitas.findIndex(
    receita => receita.id === receitaAtualizada.id
  );

  this.receitas[index] = receitaAtualizada;
}
}