import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Receita, ReceitaRequest } from './receita.model';

@Injectable({
  providedIn: 'root'
})
export class ReceitaService {

  private apiUrl = `${environment.apiUrl}/receita`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Receita[]> {
    return this.http.get<Receita[]>(this.apiUrl);
  }

  buscarPorId(id: string): Observable<Receita> {
    return this.http.get<Receita>(`${this.apiUrl}/${id}`);
  }

  criar(dto: ReceitaRequest): Observable<Receita> {
    return this.http.post<Receita>(this.apiUrl, dto);
  }

  atualizar(id: string, dto: ReceitaRequest): Observable<Receita> {
    return this.http.put<Receita>(`${this.apiUrl}/${id}`, dto);
  }

  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}