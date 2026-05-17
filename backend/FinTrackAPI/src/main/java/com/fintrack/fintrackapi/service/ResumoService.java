package com.fintrack.fintrackapi.service;

import com.fintrack.fintrackapi.dto.DespesaResponseDTO;
import com.fintrack.fintrackapi.dto.ReceitaResponseDTO;
import com.fintrack.fintrackapi.dto.ResumoResponseDTO;
import com.fintrack.fintrackapi.entity.Despesa;
import com.fintrack.fintrackapi.entity.Receita;
import com.fintrack.fintrackapi.repository.DespesaRepository;
import com.fintrack.fintrackapi.repository.ReceitaRepository;
import com.fintrack.fintrackapi.security.AuthenticatedUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResumoService {

    private final DespesaRepository despesaRepository;
    private final ReceitaRepository receitaRepository;
    private final AuthenticatedUserService authenticatedUserService;

    public ResumoResponseDTO calcular(LocalDate dataInicio, LocalDate dataFim) {
        UUID usuarioId = authenticatedUserService.getUsuarioLogado().getId();

        BigDecimal totalReceitas = receitaRepository.somarPorUsuarioEPeriodo(usuarioId, dataInicio, dataFim);
        BigDecimal totalDespesas = despesaRepository.somarPorUsuarioEPeriodo(usuarioId, dataInicio, dataFim);
        BigDecimal saldoFinal = totalReceitas.subtract(totalDespesas);

        List<ReceitaResponseDTO> receitas = receitaRepository
                .findAllByUsuarioIdAndDataRecebimentoBetween(usuarioId, dataInicio, dataFim)
                .stream()
                .map(this::toReceitaDTO)
                .collect(Collectors.toList());

        List<DespesaResponseDTO> despesas = despesaRepository
                .findAllByUsuarioIdAndDataVencimentoBetween(usuarioId, dataInicio, dataFim)
                .stream()
                .map(this::toDespesaDTO)
                .collect(Collectors.toList());

        return new ResumoResponseDTO(dataInicio, dataFim, totalReceitas, totalDespesas, saldoFinal, receitas, despesas);
    }

    private ReceitaResponseDTO toReceitaDTO(Receita receita) {
        ReceitaResponseDTO dto = new ReceitaResponseDTO();
        dto.setId(receita.getId());
        dto.setUsuarioId(receita.getUsuarioId());
        dto.setValorReceita(receita.getValorReceita());
        dto.setDataRecebimento(receita.getDataRecebimento());
        dto.setCategoria(receita.getCategoria());
        dto.setTipoSubclasse(receita.getTipoSubclasse());
        dto.setRecorrencia(receita.getRecorrencia());
        dto.setDescricao(receita.getDescricao());
        return dto;
    }

    private DespesaResponseDTO toDespesaDTO(Despesa despesa) {
        DespesaResponseDTO dto = new DespesaResponseDTO();
        dto.setId(despesa.getId());
        dto.setUsuarioId(despesa.getUsuarioId());
        dto.setValorDespesa(despesa.getValorDespesa());
        dto.setDataVencimento(despesa.getDataVencimento());
        dto.setCategoria(despesa.getCategoria());
        dto.setTipoSubclasse(despesa.getTipoSubclasse());
        dto.setRecorrencia(despesa.getRecorrencia());
        dto.setDescricao(despesa.getDescricao());
        return dto;
    }
}