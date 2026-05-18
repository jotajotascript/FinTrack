package com.fintrack.fintrackapi.controller;

import com.fintrack.fintrackapi.dto.DespesaRequestDTO;
import com.fintrack.fintrackapi.dto.DespesaResponseDTO;
import com.fintrack.fintrackapi.service.DespesaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/despesa")
@RequiredArgsConstructor
public class DespesaController {

    private final DespesaService despesaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DespesaResponseDTO criar(@RequestBody DespesaRequestDTO dto) {
        return despesaService.criar(dto);
    }

    @GetMapping
    public List<DespesaResponseDTO> listar() {
        return despesaService.listar();
    }

    @GetMapping("/{id}")
    public DespesaResponseDTO buscarPorId(@PathVariable UUID id) {
        return despesaService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public DespesaResponseDTO atualizar(@PathVariable UUID id, @RequestBody DespesaRequestDTO dto) {
        return despesaService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable UUID id) {
        despesaService.deletar(id);
    }
}