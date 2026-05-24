package com.fintrack.fintrackapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintrack.fintrackapi.dto.DespesaRequestDTO;
import com.fintrack.fintrackapi.dto.ReceitaRequestDTO;
import com.fintrack.fintrackapi.entity.Usuario;
import com.fintrack.fintrackapi.entity.enums.CategoriaEnum;
import com.fintrack.fintrackapi.entity.enums.RecorrenciaEnum;
import com.fintrack.fintrackapi.repository.UsuarioRepository;
import com.fintrack.fintrackapi.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ResumoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private String token;

    @BeforeEach
    void setUp() {
        usuarioRepository.deleteAll();

        Usuario usuario = Usuario.builder()
                .nome("João")
                .email("joao@email.com")
                .senha("senha_encriptada")
                .build();

        usuarioRepository.save(usuario);
        token = jwtService.generateToken(usuario.getEmail());
    }

    @Test
    void deveCalcularResumoComSucesso() throws Exception {
        // cria uma receita
        ReceitaRequestDTO receita = new ReceitaRequestDTO();
        receita.setValorReceita(new BigDecimal("3000.00"));
        receita.setDataRecebimento(LocalDate.of(2025, 6, 5));
        receita.setCategoria(CategoriaEnum.SALARIO);
        receita.setTipoSubclasse("CLT");
        receita.setRecorrencia(RecorrenciaEnum.MENSAL);
        receita.setDescricao("Salário");

        mockMvc.perform(post("/receita")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(receita)))
                .andExpect(status().isCreated());

        // cria uma despesa
        DespesaRequestDTO despesa = new DespesaRequestDTO();
        despesa.setValorDespesa(new BigDecimal("1000.00"));
        despesa.setDataVencimento(LocalDate.of(2025, 6, 10));
        despesa.setCategoria(CategoriaEnum.OUTROS);
        despesa.setTipoSubclasse("Aluguel");
        despesa.setRecorrencia(RecorrenciaEnum.MENSAL);
        despesa.setDescricao("Aluguel");

        mockMvc.perform(post("/despesa")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(despesa)))
                .andExpect(status().isCreated());

        // calcula resumo
        mockMvc.perform(get("/resumo")
                        .header("Authorization", "Bearer " + token)
                        .param("dataInicio", "2025-06-01")
                        .param("dataFim", "2025-06-30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalReceitas").value(3000.00))
                .andExpect(jsonPath("$.totalDespesas").value(1000.00))
                .andExpect(jsonPath("$.saldoFinal").value(2000.00));
    }

    @Test
    void deveRetornarResumoVazioQuandoSemMovimentacoes() throws Exception {
        mockMvc.perform(get("/resumo")
                        .header("Authorization", "Bearer " + token)
                        .param("dataInicio", "2025-06-01")
                        .param("dataFim", "2025-06-30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalReceitas").value(0))
                .andExpect(jsonPath("$.totalDespesas").value(0))
                .andExpect(jsonPath("$.saldoFinal").value(0));
    }

    @Test
    void deveRetornar403QuandoSemToken() throws Exception {
        mockMvc.perform(get("/resumo")
                        .param("dataInicio", "2025-06-01")
                        .param("dataFim", "2025-06-30"))
                .andExpect(status().isForbidden());
    }
}