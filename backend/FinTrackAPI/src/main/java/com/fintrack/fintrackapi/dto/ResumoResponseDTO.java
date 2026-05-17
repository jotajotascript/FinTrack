package com.fintrack.fintrackapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
public class ResumoResponseDTO {

    private LocalDate dataInicio;
    private LocalDate dataFim;
    private BigDecimal totalReceitas;
    private BigDecimal totalDespesas;
    private BigDecimal saldoFinal;
    private List<ReceitaResponseDTO> receitas;
    private List<DespesaResponseDTO> despesas;
}