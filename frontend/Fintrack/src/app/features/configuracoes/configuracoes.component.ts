import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './configuracoes.component.html',
  styleUrl: './configuracoes.component.css'
})
export class ConfiguracoesComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  private router = inject(Router);

  nomeCompleto = '';
  email = '';
  senhaAtual = '';
  novaSenha = '';
  mostrarSenha = false;

  private get headers() {
    const token = this.authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.authService.getToken();
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.nomeCompleto = payload.nome ?? this.authService.getNomeUsuario() ?? '';
          this.email = payload.email ?? payload.sub ?? '';
        } catch {
          this.nomeCompleto = this.authService.getNomeUsuario() ?? '';
        }
      }
    }
  }

  async salvarInformacoes(): Promise<void> {
    try {
      const res = await fetch(`${environment.apiUrl}/usuario`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ nome: this.nomeCompleto, email: this.email })
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).mensagem ?? `Erro ${res.status}`);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('nomeUsuario', this.nomeCompleto);
      }
      alert('Alterações salvas! Faça login novamente.');
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async alterarSenha(): Promise<void> {
    if (!this.senhaAtual || !this.novaSenha) {
      alert('Preencha os dois campos de senha.');
      return;
    }
    try {
      const res = await fetch(`${environment.apiUrl}/usuario`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ senhaAtual: this.senhaAtual, senha: this.novaSenha })
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).mensagem ?? `Erro ${res.status}`);
      alert('Senha alterada com sucesso! Faça login novamente.');
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    } catch (err: any) {
      alert(err.message);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  async excluirConta(): Promise<void> {
    if (!confirm('Tem certeza? Esta ação não pode ser desfeita.')) return;
    try {
      const res = await fetch(`${environment.apiUrl}/usuario`, {
        method: 'DELETE',
        headers: this.headers
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).mensagem ?? `Erro ${res.status}`);
      this.authService.logout();
      window.location.href = '/login';
    } catch (err: any) {
      alert(err.message);
    }
  }
}