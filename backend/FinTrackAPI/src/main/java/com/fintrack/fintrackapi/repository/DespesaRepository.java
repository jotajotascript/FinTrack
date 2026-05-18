package com.fintrack.fintrackapi.repository;

import com.fintrack.fintrackapi.entity.Despesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;

import java.util.List;
import java.util.UUID;

public interface DespesaRepository extends JpaRepository<Despesa, UUID> {

    List<Despesa> findAllByUsuarioId(UUID usuarioId);

    List<Despesa> findAllByUsuarioIdAndDataVencimentoBetween(UUID usuarioId, LocalDate dataInicio, LocalDate dataFim);

    @Query("SELECT COALESCE(SUM(d.valorDespesa), 0) FROM Despesa d WHERE d.usuarioId = :usuarioId AND d.dataVencimento BETWEEN :dataInicio AND :dataFim")
    BigDecimal somarPorUsuarioEPeriodo(@Param("usuarioId") UUID usuarioId,
                                       @Param("dataInicio") LocalDate dataInicio,
                                       @Param("dataFim") LocalDate dataFim);
}