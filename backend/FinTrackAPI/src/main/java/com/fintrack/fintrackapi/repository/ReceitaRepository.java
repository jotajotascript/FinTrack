package com.fintrack.fintrackapi.repository;

import com.fintrack.fintrackapi.entity.Receita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;

import java.util.List;
import java.util.UUID;

public interface ReceitaRepository extends JpaRepository<Receita, UUID> {

    List<Receita> findAllByUsuarioId(UUID usuarioId);

    List<Receita> findAllByUsuarioIdAndDataRecebimentoBetween(UUID usuarioId, LocalDate dataInicio, LocalDate dataFim);

    @Query("SELECT COALESCE(SUM(r.valorReceita), 0) FROM Receita r WHERE r.usuarioId = :usuarioId AND r.dataRecebimento BETWEEN :dataInicio AND :dataFim")
    BigDecimal somarPorUsuarioEPeriodo(@Param("usuarioId") UUID usuarioId,
                                       @Param("dataInicio") LocalDate dataInicio,
                                       @Param("dataFim") LocalDate dataFim);
}