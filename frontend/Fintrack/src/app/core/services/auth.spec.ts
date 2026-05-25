import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';
import { PLATFORM_ID } from '@angular/core';
import { vi, expect } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  // ========== isLoggedIn ==========

  it('deve retornar false quando nao ha token', () => {
    expect(service.isLoggedIn()).toBeFalsy();
  });

  it('deve retornar true quando ha token', () => {
    localStorage.setItem('token', 'token_fake');
    expect(service.isLoggedIn()).toBeTruthy();
  });

  // ========== getToken ==========

  it('deve retornar null quando nao ha token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('deve retornar o token quando existe', () => {
    localStorage.setItem('token', 'token_fake');
    expect(service.getToken()).toBe('token_fake');
  });

  // ========== logout ==========

  it('deve remover o token ao fazer logout', () => {
    localStorage.setItem('token', 'token_fake');
    service.logout();
    expect(service.getToken()).toBeNull();
  });

  // ========== login ==========

  it('deve salvar o token no localStorage apos login com sucesso', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ token: 'token_jwt' }), { status: 200 })
    );

    await service.login('joao@email.com', 'senha123');

    expect(localStorage.getItem('token')).toBe('token_jwt');
  });

  it('deve lancar erro quando login falhar', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 401 })
    );

    await expect(service.login('joao@email.com', 'senha_errada'))
      .rejects.toThrow('Credenciais inválidas');
  });

  // ========== register ==========

  it('deve cadastrar usuario com sucesso', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ id: '123', email: 'joao@email.com' }), { status: 200 })
    );

    const resultado = await service.register('João', 'joao@email.com', 'senha123');

    expect(resultado.email).toBe('joao@email.com');
  });

  it('deve lancar erro quando cadastro falhar', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 500 })
    );

    await expect(service.register('João', 'joao@email.com', 'senha123'))
      .rejects.toThrow('Erro ao cadastrar');
  });
});