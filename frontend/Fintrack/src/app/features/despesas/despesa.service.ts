import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
 
// Enums que espelham o backend
export type CategoriaEnum = 'ALIMENTACAO' | 'LAZER' | 'SAUDE' | 'TRANSPORTE' | 'SALARIO' | 'OUTROS';
export type RecorrenciaEnum = 'MENSAL' | 'SEMANAL' | 'ANUAL';
export type TipoSubclasse = 'FIXA' | 'VARIAVEL';
 
// Espelha DespesaResponseDTO do backend
export interface Despesa {
  id: string;            // UUID
  usuarioId: string;     // UUID
  valorDespesa: number;
  dataVencimento: string; // LocalDate → string ISO (yyyy-MM-dd)
  categoria: CategoriaEnum;
  tipoSubclasse: TipoSubclasse;
  recorrencia: RecorrenciaEnum | null;
  descricao: string;
}
 
// Espelha DespesaRequestDTO do backend
export interface DespesaRequest {
  valorDespesa: number;
  dataVencimento: string; // yyyy-MM-dd
  categoria: CategoriaEnum;
  tipoSubclasse: TipoSubclasse;
  recorrencia?: RecorrenciaEnum;
  descricao: string;
}
 
@Injectable({ providedIn: 'root' })
export class DespesaService {
 
  // O endpoint correto no backend é /despesa (sem 's')
  // O tokenInterceptor já injeta o Authorization header automaticamente
  private apiUrl = `${environment.apiUrl}/despesa`;
 
  constructor(private http: HttpClient) {}
 
  listarDespesas(): Observable<Despesa[]> {
    return this.http.get<Despesa[]>(this.apiUrl);
  }
 
  buscarPorId(id: string): Observable<Despesa> {
    return this.http.get<Despesa>(`${this.apiUrl}/${id}`);
  }
 
  salvarDespesa(dto: DespesaRequest): Observable<Despesa> {
    return this.http.post<Despesa>(this.apiUrl, dto);
  }
 
  atualizarDespesa(id: string, dto: DespesaRequest): Observable<Despesa> {
    return this.http.put<Despesa>(`${this.apiUrl}/${id}`, dto);
  }
 
  excluirDespesa(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}