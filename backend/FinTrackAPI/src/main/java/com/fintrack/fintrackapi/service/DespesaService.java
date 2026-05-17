package com.fintrack.fintrackapi.service;

import com.fintrack.fintrackapi.dto.DespesaRequestDTO;
import com.fintrack.fintrackapi.dto.DespesaResponseDTO;
import com.fintrack.fintrackapi.entity.Despesa;
import com.fintrack.fintrackapi.repository.DespesaRepository;
import com.fintrack.fintrackapi.security.AuthenticatedUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DespesaService {

    private final DespesaRepository despesaRepository;
    private final AuthenticatedUserService authenticatedUserService;

    public DespesaResponseDTO criar(DespesaRequestDTO dto) {
        UUID usuarioId = authenticatedUserService.getUsuarioLogado().getId();

        Despesa despesa = Despesa.builder()
                .usuarioId(usuarioId)
                .valorDespesa(dto.getValorDespesa())
                .dataVencimento(dto.getDataVencimento())
                .categoria(dto.getCategoria())
                .tipoSubclasse(dto.getTipoSubclasse())
                .recorrencia(dto.getRecorrencia())
                .descricao(dto.getDescricao())
                .build();

        return toDTO(despesaRepository.save(despesa));
    }

    public List<DespesaResponseDTO> listar() {
        UUID usuarioId = authenticatedUserService.getUsuarioLogado().getId();
        return despesaRepository.findAllByUsuarioId(usuarioId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public DespesaResponseDTO buscarPorId(UUID id) {
        UUID usuarioId = authenticatedUserService.getUsuarioLogado().getId();
        Despesa despesa = despesaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Despesa não encontrada"));

        if (!despesa.getUsuarioId().equals(usuarioId)) {
            throw new RuntimeException("Acesso negado");
        }

        return toDTO(despesa);
    }

    public DespesaResponseDTO atualizar(UUID id, DespesaRequestDTO dto) {
        UUID usuarioId = authenticatedUserService.getUsuarioLogado().getId();
        Despesa despesa = despesaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Despesa não encontrada"));

        if (!despesa.getUsuarioId().equals(usuarioId)) {
            throw new RuntimeException("Acesso negado");
        }

        despesa.setValorDespesa(dto.getValorDespesa());
        despesa.setDataVencimento(dto.getDataVencimento());
        despesa.setCategoria(dto.getCategoria());
        despesa.setTipoSubclasse(dto.getTipoSubclasse());
        despesa.setRecorrencia(dto.getRecorrencia());
        despesa.setDescricao(dto.getDescricao());

        return toDTO(despesaRepository.save(despesa));
    }

    public void deletar(UUID id) {
        UUID usuarioId = authenticatedUserService.getUsuarioLogado().getId();
        Despesa despesa = despesaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Despesa não encontrada"));

        if (!despesa.getUsuarioId().equals(usuarioId)) {
            throw new RuntimeException("Acesso negado");
        }

        despesaRepository.delete(despesa);
    }

    private DespesaResponseDTO toDTO(Despesa despesa) {
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