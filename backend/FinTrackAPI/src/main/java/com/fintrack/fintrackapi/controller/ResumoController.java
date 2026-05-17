package com.fintrack.fintrackapi.controller;

import com.fintrack.fintrackapi.dto.ResumoResponseDTO;
import com.fintrack.fintrackapi.service.ResumoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/resumo")
@RequiredArgsConstructor
public class ResumoController {

    private final ResumoService resumoService;

    @GetMapping
    public ResumoResponseDTO calcular(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return resumoService.calcular(dataInicio, dataFim);
    }
}