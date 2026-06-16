package com.fintrack.fintrackapi.entity;

import com.fintrack.fintrackapi.entity.enums.RecorrenciaEnum;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "receita")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Receita {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "usuario_id", nullable = false, columnDefinition = "uuid")
    private UUID usuarioId;

    @Column(name = "valor_receita", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorReceita;

    @Column(name = "data_recebimento", nullable = false)
    private LocalDate dataRecebimento;

    @Column(nullable = false)
    private String categoria;

    @Column(name = "tipo_subclasse", nullable = true)
    private String tipoSubclasse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private RecorrenciaEnum recorrencia;

    @Column(nullable = true)
    private String descricao;
}