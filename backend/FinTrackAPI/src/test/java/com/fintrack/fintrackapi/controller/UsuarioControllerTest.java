package com.fintrack.fintrackapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintrack.fintrackapi.dto.LoginRequestDTO;
import com.fintrack.fintrackapi.dto.UsuarioRequestDTO;
import com.fintrack.fintrackapi.entity.Usuario;
import com.fintrack.fintrackapi.repository.UsuarioRepository;
import com.fintrack.fintrackapi.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UsuarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private String token;

    @BeforeEach
    void setUp() {
        usuarioRepository.deleteAll();
    }

    private Usuario criarEPersistirUsuario() {
        Usuario usuario = Usuario.builder()
                .nome("João")
                .email("joao@email.com")
                .senha(passwordEncoder.encode("senha123"))
                .build();
        usuarioRepository.save(usuario);
        token = jwtService.generateToken(usuario.getEmail());
        return usuario;
    }

    @Test
    void deveCadastrarUsuarioComSucesso() throws Exception {
        UsuarioRequestDTO dto = new UsuarioRequestDTO();
        dto.setNome("João");
        dto.setEmail("joao@email.com");
        dto.setSenha("senha123");

        mockMvc.perform(post("/usuario/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("joao@email.com"));
    }

    @Test
    void deveRetornarErroQuandoEmailJaCadastrado() throws Exception {
        criarEPersistirUsuario();

        UsuarioRequestDTO dto = new UsuarioRequestDTO();
        dto.setNome("João");
        dto.setEmail("joao@email.com");
        dto.setSenha("senha123");

        mockMvc.perform(post("/usuario/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().is5xxServerError());
    }

    @Test
    void deveRealizarLoginComSucesso() throws Exception {
        criarEPersistirUsuario();

        LoginRequestDTO dto = new LoginRequestDTO();
        dto.setEmail("joao@email.com");
        dto.setSenha("senha123");

        mockMvc.perform(post("/usuario/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void deveRetornarErroComSenhaInvalida() throws Exception {
        criarEPersistirUsuario();

        LoginRequestDTO dto = new LoginRequestDTO();
        dto.setEmail("joao@email.com");
        dto.setSenha("senha_errada");

        mockMvc.perform(post("/usuario/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().is5xxServerError());
    }

    @Test
    void deveRetornarUsuarioLogado() throws Exception {
        criarEPersistirUsuario();

        mockMvc.perform(get("/usuario/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("joao@email.com"));
    }

    @Test
    void deveDeletarUsuarioLogado() throws Exception {
        criarEPersistirUsuario();

        mockMvc.perform(delete("/usuario")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }

    @Test
    void deveRetornar403QuandoSemToken() throws Exception {
        mockMvc.perform(get("/usuario/me"))
                .andExpect(status().isForbidden());
    }
}