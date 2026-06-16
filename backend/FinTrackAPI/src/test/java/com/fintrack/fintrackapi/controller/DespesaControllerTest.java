package com.fintrack.fintrackapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintrack.fintrackapi.dto.DespesaRequestDTO;
import com.fintrack.fintrackapi.entity.enums.RecorrenciaEnum;
import com.fintrack.fintrackapi.security.JwtService;
import com.fintrack.fintrackapi.entity.Usuario;
import com.fintrack.fintrackapi.repository.UsuarioRepository;
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
class DespesaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private String token;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuarioRepository.deleteAll();

        usuario = Usuario.builder()
                .nome("João")
                .email("joao@email.com")
                .senha("senha_encriptada")
                .build();

        usuarioRepository.save(usuario);
        token = jwtService.generateToken(usuario.getEmail());
    }

    private DespesaRequestDTO criarRequestDTO() {
        DespesaRequestDTO dto = new DespesaRequestDTO();
        dto.setValorDespesa(new BigDecimal("150.00"));
        dto.setDataVencimento(LocalDate.of(2025, 6, 10));
        dto.setCategoria("OUTROS");
        dto.setTipoSubclasse("Aluguel");
        dto.setRecorrencia(RecorrenciaEnum.MENSAL);
        dto.setDescricao("Aluguel apartamento");
        return dto;
    }

    @Test
    void deveCriarDespesaComSucesso() throws Exception {
        mockMvc.perform(post("/despesa")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(criarRequestDTO())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.descricao").value("Aluguel apartamento"))
                .andExpect(jsonPath("$.valorDespesa").value(150.00));
    }

    @Test
    void deveListarDespesasComSucesso() throws Exception {
        // cria uma despesa primeiro
        mockMvc.perform(post("/despesa")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(criarRequestDTO())))
                .andExpect(status().isCreated());

        // lista
        mockMvc.perform(get("/despesa")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void deveRetornar403QuandoSemToken() throws Exception {
        mockMvc.perform(get("/despesa"))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveBuscarDespesaPorIdComSucesso() throws Exception {
        // cria despesa
        String response = mockMvc.perform(post("/despesa")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(criarRequestDTO())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        // busca por id
        mockMvc.perform(get("/despesa/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id));
    }

    @Test
    void deveAtualizarDespesaComSucesso() throws Exception {
        // cria despesa
        String response = mockMvc.perform(post("/despesa")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(criarRequestDTO())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        // atualiza
        DespesaRequestDTO dtoAtualizado = criarRequestDTO();
        dtoAtualizado.setDescricao("Novo aluguel");

        mockMvc.perform(put("/despesa/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dtoAtualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.descricao").value("Novo aluguel"));
    }

    @Test
    void deveDeletarDespesaComSucesso() throws Exception {
        // cria despesa
        String response = mockMvc.perform(post("/despesa")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(criarRequestDTO())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        // deleta
        mockMvc.perform(delete("/despesa/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }
}