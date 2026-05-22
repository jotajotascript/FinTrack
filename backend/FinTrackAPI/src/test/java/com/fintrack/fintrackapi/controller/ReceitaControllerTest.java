package com.fintrack.fintrackapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintrack.fintrackapi.dto.ReceitaRequestDTO;
import com.fintrack.fintrackapi.entity.enums.CategoriaEnum;
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
class ReceitaControllerTest {

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

    private ReceitaRequestDTO criarRequestDTO() {
        ReceitaRequestDTO dto = new ReceitaRequestDTO();
        dto.setValorReceita(new BigDecimal("3000.00"));
        dto.setDataRecebimento(LocalDate.of(2025, 6, 5));
        dto.setCategoria(CategoriaEnum.SALARIO);
        dto.setTipoSubclasse("CLT");
        dto.setRecorrencia(RecorrenciaEnum.MENSAL);
        dto.setDescricao("Salário mensal");
        return dto;
    }

    @Test
    void deveCriarReceitaComSucesso() throws Exception {
        mockMvc.perform(post("/receita")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(criarRequestDTO())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.descricao").value("Salário mensal"))
                .andExpect(jsonPath("$.valorReceita").value(3000.00));
    }

    @Test
    void deveListarReceitasComSucesso() throws Exception {
        mockMvc.perform(post("/receita")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(criarRequestDTO())))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/receita")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void deveRetornar403QuandoSemToken() throws Exception {
        mockMvc.perform(get("/receita"))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveBuscarReceitaPorIdComSucesso() throws Exception {
        String response = mockMvc.perform(post("/receita")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(criarRequestDTO())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(get("/receita/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id));
    }

    @Test
    void deveAtualizarReceitaComSucesso() throws Exception {
        String response = mockMvc.perform(post("/receita")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(criarRequestDTO())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        ReceitaRequestDTO dtoAtualizado = criarRequestDTO();
        dtoAtualizado.setDescricao("Novo salário");

        mockMvc.perform(put("/receita/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dtoAtualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.descricao").value("Novo salário"));
    }

    @Test
    void deveDeletarReceitaComSucesso() throws Exception {
        String response = mockMvc.perform(post("/receita")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(criarRequestDTO())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(delete("/receita/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }
}