package com.fintrack.fintrackapi.entity;

import com.fintrack.fintrackapi.entity.enums.RecorrenciaEnum;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "despesa")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Despesa {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "usuario_id", nullable = false, columnDefinition = "uuid")
    private UUID usuarioId;

    @Column(name = "valor_despesa", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorDespesa;

    @Column(name = "data_vencimento", nullable = false)
    private LocalDate dataVencimento;

    @Column(nullable = false)
    private String categoria;

    @Column(name = "tipo_subclasse", nullable = false)
    private String tipoSubclasse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private RecorrenciaEnum recorrencia;

    @Column(nullable = true)
    private String descricao;
}