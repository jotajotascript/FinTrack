import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);

  async login(email: string, senha: string): Promise<void> {
    const response = await fetch(
      `${environment.apiUrl}/usuario/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      }
    );

    if (!response.ok) {
      const status = response.status;
      console.error('[Auth] Login falhou. Status:', status);
      if (status === 401 || status === 403) {
        throw new Error('Credenciais inválidas');
      }
      throw new Error(`Erro no servidor (${status}). Tente novamente.`);
    }

    const data = await response.json();
    console.log('[Auth] Login OK. Campos recebidos:', Object.keys(data));

    if (isPlatformBrowser(this.platformId)) {
      // Suporta tanto { token } quanto { accessToken }
      const token = data.token ?? data.accessToken ?? data.access_token;
      const nome = data.nome ?? data.name ?? data.username ?? data.nomeUsuario ?? '';
      if (!token) {
        console.error('[Auth] Token não encontrado na resposta:', data);
        throw new Error('Resposta inválida do servidor.');
      }
      localStorage.setItem('token', token);
      localStorage.setItem('nomeUsuario', nome);
    }
  }

  async register(nome: string, email: string, senha: string) {
    const response = await fetch(
      `${environment.apiUrl}/usuario/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao cadastrar');
    }

    return await response.json();
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('nomeUsuario');
    }
  }

  getNomeUsuario(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('nomeUsuario');
    }
    return null;
  }
}
