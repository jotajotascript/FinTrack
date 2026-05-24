package com.fintrack.fintrackapi.service;
import com.fintrack.fintrackapi.dto.LoginRequestDTO;
import com.fintrack.fintrackapi.dto.UsuarioRequestDTO;
import com.fintrack.fintrackapi.entity.Usuario;
import com.fintrack.fintrackapi.repository.UsuarioRepository;
import com.fintrack.fintrackapi.security.AuthenticatedUserService;
import com.fintrack.fintrackapi.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticatedUserService authenticatedUserService;

    @InjectMocks
    private UsuarioService usuarioService;

    // ========== HELPERS ==========

    private Usuario criarUsuario() {
        return Usuario.builder()
                .id(UUID.randomUUID())
                .nome("João")
                .email("joao@email.com")
                .senha("senha_encriptada")
                .build();
    }

    private UsuarioRequestDTO criarRequestDTO() {
        UsuarioRequestDTO dto = new UsuarioRequestDTO();
        dto.setNome("João");
        dto.setEmail("joao@email.com");
        dto.setSenha("senha123");
        return dto;
    }

    // ========== CADASTRAR ==========

    @Test
    void deveCadastrarUsuarioComSucesso() {
        UsuarioRequestDTO dto = criarRequestDTO();
        Usuario usuarioSalvo = criarUsuario();

        when(usuarioRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(dto.getSenha())).thenReturn("senha_encriptada");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioSalvo);

        Usuario resultado = usuarioService.cadastrar(dto);

        assertNotNull(resultado);
        assertEquals("joao@email.com", resultado.getEmail());
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    void deveLancarExcecaoQuandoEmailJaCadastrado() {
        UsuarioRequestDTO dto = criarRequestDTO();

        when(usuarioRepository.existsByEmail(dto.getEmail())).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> usuarioService.cadastrar(dto));

        assertEquals("Email já cadastrado", ex.getMessage());
        verify(usuarioRepository, never()).save(any());
    }

    // ========== LOGIN ==========

    @Test
    void deveRealizarLoginComSucesso() {
        LoginRequestDTO dto = new LoginRequestDTO();
        dto.setEmail("joao@email.com");
        dto.setSenha("senha123");

        Usuario usuario = criarUsuario();

        when(usuarioRepository.findByEmail(dto.getEmail())).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches(dto.getSenha(), usuario.getSenha())).thenReturn(true);
        when(jwtService.generateToken(usuario.getEmail())).thenReturn("token_jwt");

        var resultado = usuarioService.login(dto);

        assertEquals("token_jwt", resultado.getToken());
        assertEquals("João", resultado.getNome());     
    }

    @Test
    void deveLancarExcecaoQuandoUsuarioNaoEncontradoNoLogin() {
        LoginRequestDTO dto = new LoginRequestDTO();
        dto.setEmail("inexistente@email.com");
        dto.setSenha("senha123");

        when(usuarioRepository.findByEmail(dto.getEmail())).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> usuarioService.login(dto));

        assertEquals("Usuário não encontrado", ex.getMessage());
    }

    @Test
    void deveLancarExcecaoQuandoSenhaInvalida() {
        LoginRequestDTO dto = new LoginRequestDTO();
        dto.setEmail("joao@email.com");
        dto.setSenha("senha_errada");

        Usuario usuario = criarUsuario();

        when(usuarioRepository.findByEmail(dto.getEmail())).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches(dto.getSenha(), usuario.getSenha())).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> usuarioService.login(dto));

        assertEquals("Senha inválida", ex.getMessage());
    }

    // ========== DELETAR ==========

    @Test
    void deveDeletarUsuarioLogadoComSucesso() {
        Usuario usuario = criarUsuario();

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(usuario);

        usuarioService.deletar();

        verify(usuarioRepository, times(1)).delete(usuario);
    }
}