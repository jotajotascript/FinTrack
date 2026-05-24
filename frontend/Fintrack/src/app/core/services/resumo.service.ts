import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth';

export interface ResumoResponse {
    dataInicio: string;
    dataFim: string;
    totalReceitas: number;
    totalDespesas: number;
    saldoFinal: number;
}

@Injectable({ providedIn: 'root' })
export class ResumoService {
    constructor(private authService: AuthService) {}

    async getResumo(dataInicio: string, dataFim: string): Promise<ResumoResponse> {
        const token = this.authService.getToken();
        const response = await fetch(
            `${environment.apiUrl}/resumo?dataInicio=${dataInicio}&dataFim=${dataFim}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        if (!response.ok) throw new Error('Erro ao buscar resumo');
        return response.json();
    }
}