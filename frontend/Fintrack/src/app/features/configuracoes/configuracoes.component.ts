import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './configuracoes.component.html',
  styleUrl: './configuracoes.component.css'
})
export class ConfiguracoesComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  nomeCompleto = '';
  email = '';
  senhaAtual = '';
  novaSenha = '';
  mostrarSenha = false;

  private get token(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {})
    };
  }

  ngOnInit(): void {
    // Lê nome e email direto do payload do JWT — não depende de rota extra
    if (this.token) {
      try {
        const payload = JSON.parse(atob(this.token.split('.')[1]));
        this.nomeCompleto = payload.nome ?? localStorage.getItem('nomeUsuario') ?? '';
        this.email = payload.email ?? payload.sub ?? '';
      } catch {
        this.nomeCompleto = localStorage.getItem('nomeUsuario') ?? '';
      }
    }
  }

  async salvarInformacoes(): Promise<void> {
    try {
      const res = await fetch(`${environment.apiUrl}/usuario/perfil`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ nome: this.nomeCompleto, email: this.email })
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).mensagem ?? `Erro ${res.status}`);
      if (isPlatformBrowser(this.platformId)) localStorage.setItem('nomeUsuario', this.nomeCompleto);
      alert('Alterações salvas!');
    } catch (err: any) {
      alert(err.message);
    }
  }

  async alterarSenha(): Promise<void> {
    if (!this.senhaAtual || !this.novaSenha) { alert('Preencha os dois campos de senha.'); return; }
    try {
      const res = await fetch(`${environment.apiUrl}/usuario/senha`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ senhaAtual: this.senhaAtual, novaSenha: this.novaSenha })
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).mensagem ?? `Erro ${res.status}`);
      this.senhaAtual = '';
      this.novaSenha = '';
      alert('Senha alterada!');
    } catch (err: any) {
      alert(err.message);
    }
  }

  async excluirConta(): Promise<void> {
    if (!confirm('Tem certeza? Esta ação não pode ser desfeita.')) return;
    try {
      const res = await fetch(`${environment.apiUrl}/usuario`, {
        method: 'DELETE',
        headers: this.headers
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).mensagem ?? `Erro ${res.status}`);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('token');
        localStorage.removeItem('nomeUsuario');
      }
      window.location.href = '/login';
    } catch (err: any) {
      alert(err.message);
    }
  }
}