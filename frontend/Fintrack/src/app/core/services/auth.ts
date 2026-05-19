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
        body: JSON.stringify({
          email,
          senha
        })
      }
    );

    if (!response.ok) {
      throw new Error('Credenciais inválidas');
    }

    const data = await response.json();

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', data.token);
    }
  }

  async register(
    nome: string,
    email: string,
    senha: string
  ) {
    const response = await fetch(
      `${environment.apiUrl}/usuario/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome,
          email,
          senha
        })
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
    }
  }
}