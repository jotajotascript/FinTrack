import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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

  constructor(private http: HttpClient, private router: Router) {}

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
      await firstValueFrom(
        this.http.post('http://localhost:8080/usuario/register', {
          nome: this.nome,
          email: this.email,
          senha: this.senha
        })
      );

      this.sucesso = 'Conta criada com sucesso! Redirecionando...';
      setTimeout(() => this.router.navigate(['/auth/login']), 2000);

    } catch (error: any) {
      this.erro = error?.error?.message || 'Erro ao cadastrar. Tente novamente.';
      console.error('Erro no cadastro:', error);
    } finally {
      this.carregando = false;
    }
  }

  irParaLogin() {
    this.router.navigate(['/auth/login']);
  }
}