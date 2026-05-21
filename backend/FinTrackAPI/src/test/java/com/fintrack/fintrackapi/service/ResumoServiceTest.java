package com.fintrack.fintrackapi.service;

import com.fintrack.fintrackapi.dto.ResumoResponseDTO;
import com.fintrack.fintrackapi.entity.Despesa;
import com.fintrack.fintrackapi.entity.Receita;
import com.fintrack.fintrackapi.entity.Usuario;
import com.fintrack.fintrackapi.entity.enums.CategoriaEnum;
import com.fintrack.fintrackapi.entity.enums.RecorrenciaEnum;
import com.fintrack.fintrackapi.repository.DespesaRepository;
import com.fintrack.fintrackapi.repository.ReceitaRepository;
import com.fintrack.fintrackapi.security.AuthenticatedUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResumoServiceTest {

    @Mock
    private DespesaRepository despesaRepository;

    @Mock
    private ReceitaRepository receitaRepository;

    @Mock
    private AuthenticatedUserService authenticatedUserService;

    @InjectMocks
    private ResumoService resumoService;

    // ========== HELPERS ==========

    private Usuario criarUsuario(UUID id) {
        return Usuario.builder()
                .id(id)
                .nome("João")
                .email("joao@email.com")
                .build();
    }

    private Receita criarReceita(UUID usuarioId) {
        return Receita.builder()
                .id(UUID.randomUUID())
                .usuarioId(usuarioId)
                .valorReceita(new BigDecimal("3000.00"))
                .dataRecebimento(LocalDate.of(2025, 6, 5))
                .categoria(CategoriaEnum.SALARIO)
                .tipoSubclasse("CLT")
                .recorrencia(RecorrenciaEnum.MENSAL)
                .descricao("Salário")
                .build();
    }

    private Despesa criarDespesa(UUID usuarioId) {
        return Despesa.builder()
                .id(UUID.randomUUID())
                .usuarioId(usuarioId)
                .valorDespesa(new BigDecimal("1000.00"))
                .dataVencimento(LocalDate.of(2025, 6, 10))
                .categoria(CategoriaEnum.OUTROS)
                .tipoSubclasse("Aluguel")
                .recorrencia(RecorrenciaEnum.MENSAL)
                .descricao("Aluguel")
                .build();
    }

    // ========== CALCULAR ==========

    @Test
    void deveCalcularResumoComSucesso() {
        UUID usuarioId = UUID.randomUUID();
        LocalDate inicio = LocalDate.of(2025, 6, 1);
        LocalDate fim = LocalDate.of(2025, 6, 30);

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(receitaRepository.somarPorUsuarioEPeriodo(usuarioId, inicio, fim)).thenReturn(new BigDecimal("3000.00"));
        when(despesaRepository.somarPorUsuarioEPeriodo(usuarioId, inicio, fim)).thenReturn(new BigDecimal("1000.00"));
        when(receitaRepository.findAllByUsuarioIdAndDataRecebimentoBetween(usuarioId, inicio, fim)).thenReturn(List.of(criarReceita(usuarioId)));
        when(despesaRepository.findAllByUsuarioIdAndDataVencimentoBetween(usuarioId, inicio, fim)).thenReturn(List.of(criarDespesa(usuarioId)));

        ResumoResponseDTO resultado = resumoService.calcular(inicio, fim);

        assertNotNull(resultado);
        assertEquals(new BigDecimal("3000.00"), resultado.getTotalReceitas());
        assertEquals(new BigDecimal("1000.00"), resultado.getTotalDespesas());
        assertEquals(new BigDecimal("2000.00"), resultado.getSaldoFinal());
        assertEquals(1, resultado.getReceitas().size());
        assertEquals(1, resultado.getDespesas().size());
    }

    @Test
    void deveRetornarSaldoNegativoQuandoDespesasMaioresQueReceitas() {
        UUID usuarioId = UUID.randomUUID();
        LocalDate inicio = LocalDate.of(2025, 6, 1);
        LocalDate fim = LocalDate.of(2025, 6, 30);

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(receitaRepository.somarPorUsuarioEPeriodo(usuarioId, inicio, fim)).thenReturn(new BigDecimal("500.00"));
        when(despesaRepository.somarPorUsuarioEPeriodo(usuarioId, inicio, fim)).thenReturn(new BigDecimal("1500.00"));
        when(receitaRepository.findAllByUsuarioIdAndDataRecebimentoBetween(usuarioId, inicio, fim)).thenReturn(List.of());
        when(despesaRepository.findAllByUsuarioIdAndDataVencimentoBetween(usuarioId, inicio, fim)).thenReturn(List.of());

        ResumoResponseDTO resultado = resumoService.calcular(inicio, fim);

        assertEquals(new BigDecimal("-1000.00"), resultado.getSaldoFinal());
    }

    @Test
    void deveRetornarListasVaziosQuandoNaoHouverMovimentacoes() {
        UUID usuarioId = UUID.randomUUID();
        LocalDate inicio = LocalDate.of(2025, 6, 1);
        LocalDate fim = LocalDate.of(2025, 6, 30);

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(receitaRepository.somarPorUsuarioEPeriodo(usuarioId, inicio, fim)).thenReturn(BigDecimal.ZERO);
        when(despesaRepository.somarPorUsuarioEPeriodo(usuarioId, inicio, fim)).thenReturn(BigDecimal.ZERO);
        when(receitaRepository.findAllByUsuarioIdAndDataRecebimentoBetween(usuarioId, inicio, fim)).thenReturn(List.of());
        when(despesaRepository.findAllByUsuarioIdAndDataVencimentoBetween(usuarioId, inicio, fim)).thenReturn(List.of());

        ResumoResponseDTO resultado = resumoService.calcular(inicio, fim);

        assertEquals(0, resultado.getReceitas().size());
        assertEquals(0, resultado.getDespesas().size());
        assertEquals(BigDecimal.ZERO, resultado.getSaldoFinal());
    }
}