package com.fintrack.fintrackapi.dto;

import com.fintrack.fintrackapi.entity.enums.CategoriaEnum;
import com.fintrack.fintrackapi.entity.enums.RecorrenciaEnum;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ReceitaRequestDTO {

    private BigDecimal valorReceita;
    private LocalDate dataRecebimento;
    private CategoriaEnum categoria;
    private String tipoSubclasse;
    private RecorrenciaEnum recorrencia;
    private String descricao;
}