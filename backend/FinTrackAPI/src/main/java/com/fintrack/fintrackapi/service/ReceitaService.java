package com.fintrack.fintrackapi.service;

import com.fintrack.fintrackapi.dto.ReceitaRequestDTO;
import com.fintrack.fintrackapi.dto.ReceitaResponseDTO;
import com.fintrack.fintrackapi.entity.Receita;
import com.fintrack.fintrackapi.repository.ReceitaRepository;
import com.fintrack.fintrackapi.security.AuthenticatedUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReceitaService {

    private final ReceitaRepository receitaRepository;
    private final AuthenticatedUserService authenticatedUserService;

    public ReceitaResponseDTO criar(ReceitaRequestDTO dto) {
        UUID usuarioId = authenticatedUserService.getUsuarioLogado().getId();

        Receita receita = Receita.builder()
                .usuarioId(usuarioId)
                .valorReceita(dto.getValorReceita())
                .dataRecebimento(dto.getDataRecebimento())
                .categoria(dto.getCategoria())
                .tipoSubclasse(dto.getTipoSubclasse())
                .recorrencia(dto.getRecorrencia())
                .descricao(dto.getDescricao())
                .build();

        return toDTO(receitaRepository.save(receita));
    }

    public List<ReceitaResponseDTO> listar() {
        UUID usuarioId = authenticatedUserService.getUsuarioLogado().getId();
        return receitaRepository.findAllByUsuarioId(usuarioId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ReceitaResponseDTO buscarPorId(UUID id) {
        UUID usuarioId = authenticatedUserService.getUsuarioLogado().getId();
        Receita receita = receitaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receita não encontrada"));

        if (!receita.getUsuarioId().equals(usuarioId)) {
            throw new RuntimeException("Acesso negado");
        }

        return toDTO(receita);
    }

    public ReceitaResponseDTO atualizar(UUID id, ReceitaRequestDTO dto) {
        UUID usuarioId = authenticatedUserService.getUsuarioLogado().getId();
        Receita receita = receitaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receita não encontrada"));

        if (!receita.getUsuarioId().equals(usuarioId)) {
            throw new RuntimeException("Acesso negado");
        }

        receita.setValorReceita(dto.getValorReceita());
        receita.setDataRecebimento(dto.getDataRecebimento());
        receita.setCategoria(dto.getCategoria());
        receita.setTipoSubclasse(dto.getTipoSubclasse());
        receita.setRecorrencia(dto.getRecorrencia());
        receita.setDescricao(dto.getDescricao());

        return toDTO(receitaRepository.save(receita));
    }

    public void deletar(UUID id) {
        UUID usuarioId = authenticatedUserService.getUsuarioLogado().getId();
        Receita receita = receitaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receita não encontrada"));

        if (!receita.getUsuarioId().equals(usuarioId)) {
            throw new RuntimeException("Acesso negado");
        }

        receitaRepository.delete(receita);
    }

    private ReceitaResponseDTO toDTO(Receita receita) {
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
}