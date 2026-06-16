package com.fintrack.fintrackapi.service;

import com.fintrack.fintrackapi.dto.ReceitaRequestDTO;
import com.fintrack.fintrackapi.dto.ReceitaResponseDTO;
import com.fintrack.fintrackapi.entity.Receita;
import com.fintrack.fintrackapi.entity.Usuario;
import com.fintrack.fintrackapi.entity.enums.RecorrenciaEnum;
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
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReceitaServiceTest {

    @Mock
    private ReceitaRepository receitaRepository;

    @Mock
    private AuthenticatedUserService authenticatedUserService;

    @InjectMocks
    private ReceitaService receitaService;

    // ========== HELPERS ==========

    private Usuario criarUsuario(UUID id) {
        return Usuario.builder()
                .id(id)
                .nome("João")
                .email("joao@email.com")
                .build();
    }

    private Receita criarReceita(UUID id, UUID usuarioId) {
        return Receita.builder()
                .id(id)
                .usuarioId(usuarioId)
                .valorReceita(new BigDecimal("3000.00"))
                .dataRecebimento(LocalDate.of(2025, 6, 5))
                
                // CORRIGIDO: Alterado de CategoriaEnum para String pura
                .categoria("Salário")
                
                .tipoSubclasse("CLT")
                .recorrencia(RecorrenciaEnum.MENSAL)
                .descricao("Salário mensal")
                .build();
    }

    private ReceitaRequestDTO criarRequestDTO() {
        ReceitaRequestDTO dto = new ReceitaRequestDTO();
        dto.setValorReceita(new BigDecimal("3000.00"));
        dto.setDataRecebimento(LocalDate.of(2025, 6, 5));
        
        // CORRIGIDO: Alterado de CategoriaEnum para String pura
        dto.setCategoria("Salário");
        
        dto.setTipoSubclasse("CLT");
        dto.setRecorrencia(RecorrenciaEnum.MENSAL);
        dto.setDescricao("Salário mensal");
        return dto;
    }

    // ========== LISTAR ==========

    @Test
    void deveListarReceitasDoUsuarioLogado() {
        UUID usuarioId = UUID.randomUUID();
        Receita receita = criarReceita(UUID.randomUUID(), usuarioId);

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(receitaRepository.findAllByUsuarioId(usuarioId)).thenReturn(List.of(receita));

        List<ReceitaResponseDTO> resultado = receitaService.listar();

        assertEquals(1, resultado.size());
        assertEquals("Salário mensal", resultado.get(0).getDescricao());
    }

    // ========== CRIAR ==========

    @Test
    void deveCriarReceitaComSucesso() {
        UUID usuarioId = UUID.randomUUID();
        Receita receitaSalva = criarReceita(UUID.randomUUID(), usuarioId);

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(receitaRepository.save(any(Receita.class))).thenReturn(receitaSalva);

        ReceitaResponseDTO resultado = receitaService.criar(criarRequestDTO());

        assertNotNull(resultado);
        assertEquals(new BigDecimal("3000.00"), resultado.getValorReceita());
        assertEquals(usuarioId, resultado.getUsuarioId());
    }

    // ========== BUSCAR POR ID ==========

    @Test
    void deveBuscarReceitaPorIdComSucesso() {
        UUID usuarioId = UUID.randomUUID();
        UUID receitaId = UUID.randomUUID();
        Receita receita = criarReceita(receitaId, usuarioId);

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(receitaRepository.findById(receitaId)).thenReturn(Optional.of(receita));

        ReceitaResponseDTO resultado = receitaService.buscarPorId(receitaId);

        assertNotNull(resultado);
        assertEquals(receitaId, resultado.getId());
    }

    @Test
    void deveLancarExcecaoQuandoReceitaNaoEncontradaAoBuscar() {
        UUID usuarioId = UUID.randomUUID();
        UUID receitaId = UUID.randomUUID();

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(receitaRepository.findById(receitaId)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> receitaService.buscarPorId(receitaId));

        assertEquals("Receita não encontrada", ex.getMessage());
    }

    @Test
    void deveLancarExcecaoDeAcessoNegadoAoBuscarReceita() {
        UUID usuarioId = UUID.randomUUID();
        UUID outroUsuarioId = UUID.randomUUID();
        UUID receitaId = UUID.randomUUID();

        Receita receitaDeOutro = criarReceita(receitaId, outroUsuarioId);

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(receitaRepository.findById(receitaId)).thenReturn(Optional.of(receitaDeOutro));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> receitaService.buscarPorId(receitaId));

        assertEquals("Acesso negado", ex.getMessage());
    }

    // ========== ATUALIZAR ==========

    @Test
    void deveAtualizarReceitaComSucesso() {
        UUID usuarioId = UUID.randomUUID();
        UUID receitaId = UUID.randomUUID();
        Receita receita = criarReceita(receitaId, usuarioId);

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(receitaRepository.findById(receitaId)).thenReturn(Optional.of(receita));
        when(receitaRepository.save(any(Receita.class))).thenReturn(receita);

        ReceitaResponseDTO resultado = receitaService.atualizar(receitaId, criarRequestDTO());

        assertNotNull(resultado);
        verify(receitaRepository, times(1)).save(receita);
    }

    @Test
    void deveLancarExcecaoQuandoReceitaNaoEncontradaAoAtualizar() {
        UUID usuarioId = UUID.randomUUID();
        UUID receitaId = UUID.randomUUID();

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(receitaRepository.findById(receitaId)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> receitaService.atualizar(receitaId, criarRequestDTO()));

        assertEquals("Receita não encontrada", ex.getMessage());
    }

    @Test
    void deveLancarExcecaoDeAcessoNegadoAoAtualizar() {
        UUID usuarioId = UUID.randomUUID();
        UUID outroUsuarioId = UUID.randomUUID();
        UUID receitaId = UUID.randomUUID();

        Receita receitaDeOutro = criarReceita(receitaId, outroUsuarioId);

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(receitaRepository.findById(receitaId)).thenReturn(Optional.of(receitaDeOutro));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> receitaService.atualizar(receitaId, criarRequestDTO()));

        assertEquals("Acesso negado", ex.getMessage());
    }

    // ========== DELETAR ==========

    @Test
    void deveDeletarReceitaComSucesso() {
        UUID usuarioId = UUID.randomUUID();
        UUID receitaId = UUID.randomUUID();
        Receita receita = criarReceita(receitaId, usuarioId);

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(receitaRepository.findById(receitaId)).thenReturn(Optional.of(receita));

        receitaService.deletar(receitaId);

        verify(receitaRepository, times(1)).delete(receita);
    }

    @Test
    void deveLancarExcecaoQuandoReceitaNaoEncontradaAoDeletar() {
        UUID usuarioId = UUID.randomUUID();
        UUID receitaId = UUID.randomUUID();

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(receitaRepository.findById(receitaId)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> receitaService.deletar(receitaId));

        assertEquals("Receita não encontrada", ex.getMessage());
    }

    @Test
    void deveLancarExcecaoDeAcessoNegadoAoDeletar() {
        UUID usuarioId = UUID.randomUUID();
        UUID outroUsuarioId = UUID.randomUUID();
        UUID receitaId = UUID.randomUUID();

        Receita receitaDeOutro = criarReceita(receitaId, outroUsuarioId);

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(receitaRepository.findById(receitaId)).thenReturn(Optional.of(receitaDeOutro));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> receitaService.deletar(receitaId));

        assertEquals("Acesso negado", ex.getMessage());
    }
}