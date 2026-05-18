package com.fintrack.fintrackapi.controller;

import com.fintrack.fintrackapi.dto.ReceitaRequestDTO;
import com.fintrack.fintrackapi.dto.ReceitaResponseDTO;
import com.fintrack.fintrackapi.service.ReceitaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/receita")
@RequiredArgsConstructor
public class ReceitaController {

    private final ReceitaService receitaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReceitaResponseDTO criar(@RequestBody ReceitaRequestDTO dto) {
        return receitaService.criar(dto);
    }

    @GetMapping
    public List<ReceitaResponseDTO> listar() {
        return receitaService.listar();
    }

    @GetMapping("/{id}")
    public ReceitaResponseDTO buscarPorId(@PathVariable UUID id) {
        return receitaService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public ReceitaResponseDTO atualizar(@PathVariable UUID id, @RequestBody ReceitaRequestDTO dto) {
        return receitaService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable UUID id) {
        receitaService.deletar(id);
    }
}