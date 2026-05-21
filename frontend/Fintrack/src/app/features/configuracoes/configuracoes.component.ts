import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './configuracoes.component.html',
  styleUrl: './configuracoes.component.css'
})
export class ConfiguracoesComponent {
  nomeCompleto = 'Ricardo Oliveira';
  email = 'ricardo.oliveira@fintrack.com';
  senhaAtual = '';
  novaSenha = '';
  mostrarSenha = false;

  salvarInformacoes(): void {
    // integrar com serviço de usuário
    alert('Alterações salvas!');
  }

  alterarSenha(): void {
    // integrar com serviço de auth
    alert('Senha alterada!');
  }

  excluirConta(): void {
    if (confirm('Tem certeza? Esta ação não pode ser desfeita.')) {
      // integrar com serviço de auth
    }
  }
}