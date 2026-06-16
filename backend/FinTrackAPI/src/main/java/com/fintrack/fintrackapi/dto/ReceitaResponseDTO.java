package com.fintrack.fintrackapi.dto;

import com.fintrack.fintrackapi.entity.enums.RecorrenciaEnum;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ReceitaResponseDTO {

    private UUID id;
    private UUID usuarioId;
    private BigDecimal valorReceita;
    private LocalDate dataRecebimento;
    private String categoria;
    private String tipoSubclasse;
    private RecorrenciaEnum recorrencia;
    private String descricao;
}