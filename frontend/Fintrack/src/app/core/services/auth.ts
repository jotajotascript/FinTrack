import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

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

    localStorage.setItem('token', data.token);
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
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}