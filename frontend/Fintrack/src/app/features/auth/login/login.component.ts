import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  senha: string = '';
  erro: string = '';
  carregando: boolean = false;
  mostrarSenha: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  async entrar() {
    if (!this.email || !this.senha) {
      this.erro = 'Preencha o e-mail e a senha.';
      return;
    }

    this.carregando = true;
    this.erro = '';

    try {
      await this.authService.login(this.email, this.senha);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.erro = 'E-mail ou senha incorretos.';
      console.error('Erro no login:', error);
    } finally {
      this.carregando = false;
    }
  }
}