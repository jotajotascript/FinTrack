import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth'; // Usando o serviço

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  nome: string = '';
  email: string = '';
  senha: string = '';
  confirmarSenha: string = '';
  erro: string = '';
  sucesso: string = '';
  carregando: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  async cadastrar() {
    if (!this.nome || !this.email || !this.senha || !this.confirmarSenha) {
      this.erro = 'Preencha todos os campos.';
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.erro = 'As senhas não coincidem.';
      return;
    }

    this.carregando = true;
    this.erro = '';
    this.sucesso = '';

    try {
      await this.authService.register(this.nome, this.email, this.senha);

      this.sucesso = 'Conta criada com sucesso! Redirecionando...';
      setTimeout(() => this.router.navigate(['/auth/login']), 2000);

    } catch (error: any) {
      this.erro = error.message || 'Erro ao cadastrar. Tente novamente.';
    } finally {
      this.carregando = false;
    }
  }

  irParaLogin() {
    this.router.navigate(['/auth/login']);
  }
}