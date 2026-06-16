package com.fintrack.fintrackapi.service;

import com.fintrack.fintrackapi.dto.DespesaRequestDTO;
import com.fintrack.fintrackapi.dto.DespesaResponseDTO;
import com.fintrack.fintrackapi.entity.Despesa;
import com.fintrack.fintrackapi.entity.Usuario;
import com.fintrack.fintrackapi.entity.enums.RecorrenciaEnum;
import com.fintrack.fintrackapi.repository.DespesaRepository;
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
class DespesaServiceTest {

    @Mock
    private DespesaRepository despesaRepository;

    @Mock
    private AuthenticatedUserService authenticatedUserService;

    @InjectMocks
    private DespesaService despesaService;

    // ========== HELPERS ==========

    private Usuario criarUsuario(UUID id) {
        return Usuario.builder()
                .id(id)
                .nome("João")
                .email("joao@email.com")
                .build();
    }

    private Despesa criarDespesa(UUID id, UUID usuarioId) {
        return Despesa.builder()
                .id(id)
                .usuarioId(usuarioId)
                .valorDespesa(new BigDecimal("150.00"))
                .dataVencimento(LocalDate.of(2025, 6, 10))
                
                // CORRIGIDO: Modificado de CategoriaEnum.OUTROS para String pura
                .categoria("Outros")
                
                .tipoSubclasse("Aluguel")
                .recorrencia(RecorrenciaEnum.MENSAL)
                .descricao("Aluguel apartamento")
                .build();
    }

    private DespesaRequestDTO criarRequestDTO() {
        DespesaRequestDTO dto = new DespesaRequestDTO();
        dto.setValorDespesa(new BigDecimal("150.00"));
        dto.setDataVencimento(LocalDate.of(2025, 6, 10));
        
        // CORRIGIDO: Modificado de CategoriaEnum.OUTROS para String pura
        dto.setCategoria("Outros");
        
        dto.setTipoSubclasse("Aluguel");
        dto.setRecorrencia(RecorrenciaEnum.MENSAL);
        dto.setDescricao("Aluguel apartamento");
        return dto;
    }

    // ========== LISTAR ==========

    @Test
    void deveListarDespesasDoUsuarioLogado() {
        UUID usuarioId = UUID.randomUUID();
        Usuario usuario = criarUsuario(usuarioId);
        Despesa despesa = criarDespesa(UUID.randomUUID(), usuarioId);

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(usuario);
        when(despesaRepository.findAllByUsuarioId(usuarioId)).thenReturn(List.of(despesa));

        List<DespesaResponseDTO> resultado = despesaService.listar();

        assertEquals(1, resultado.size());
        assertEquals("Aluguel apartamento", resultado.get(0).getDescricao());
    }

    // ========== CRIAR ==========

    @Test
    void deveCriarDespesaComSucesso() {
        UUID usuarioId = UUID.randomUUID();
        Usuario usuario = criarUsuario(usuarioId);
        DespesaRequestDTO dto = criarRequestDTO();
        Despesa despesaSalva = criarDespesa(UUID.randomUUID(), usuarioId);

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(usuario);
        when(despesaRepository.save(any(Despesa.class))).thenReturn(despesaSalva);

        DespesaResponseDTO resultado = despesaService.criar(dto);

        assertNotNull(resultado);
        assertEquals(new BigDecimal("150.00"), resultado.getValorDespesa());
        assertEquals(usuarioId, resultado.getUsuarioId());
    }

    // ========== BUSCAR POR ID ==========

    @Test
    void deveBuscarDespesaPorIdComSucesso() {
        UUID usuarioId = UUID.randomUUID();
        UUID despesaId = UUID.randomUUID();
        Usuario usuario = criarUsuario(usuarioId);
        Despesa despesa = criarDespesa(despesaId, usuarioId);

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(usuario);
        when(despesaRepository.findById(despesaId)).thenReturn(Optional.of(despesa));

        DespesaResponseDTO resultado = despesaService.buscarPorId(despesaId);

        assertNotNull(resultado);
        assertEquals(despesaId, resultado.getId());
    }

    @Test
    void deveLancarExcecaoQuandoDespesaNaoEncontradaAoBuscar() {
        UUID usuarioId = UUID.randomUUID();
        UUID despesaId = UUID.randomUUID();

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(despesaRepository.findById(despesaId)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> despesaService.buscarPorId(despesaId));

        assertEquals("Despesa não encontrada", ex.getMessage());
    }

    @Test
    void deveLancarExcecaoQuandoUsuarioNaoTemAcessoAoDespesa() {
        UUID usuarioId = UUID.randomUUID();
        UUID outroUsuarioId = UUID.randomUUID();
        UUID despesaId = UUID.randomUUID();

        Despesa despesaDeOutro = criarDespesa(despesaId, outroUsuarioId);

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(despesaRepository.findById(despesaId)).thenReturn(Optional.of(despesaDeOutro));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> despesaService.buscarPorId(despesaId));

        assertEquals("Acesso negado", ex.getMessage());
    }

    // ========== ATUALIZAR ==========

    @Test
    void deveAtualizarDespesaComSucesso() {
        UUID usuarioId = UUID.randomUUID();
        UUID despesaId = UUID.randomUUID();
        Usuario usuario = criarUsuario(usuarioId);
        Despesa despesa = criarDespesa(despesaId, usuarioId);
        DespesaRequestDTO dto = criarRequestDTO();
        dto.setDescricao("Novo aluguel");

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(usuario);
        when(despesaRepository.findById(despesaId)).thenReturn(Optional.of(despesa));
        when(despesaRepository.save(any(Despesa.class))).thenReturn(despesa);

        DespesaResponseDTO resultado = despesaService.atualizar(despesaId, dto);

        assertNotNull(resultado);
        verify(despesaRepository, times(1)).save(despesa);
    }

    @Test
    void deveLancarExcecaoQuandoDespesaNaoEncontradaAoAtualizar() {
        UUID usuarioId = UUID.randomUUID();
        UUID despesaId = UUID.randomUUID();

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(despesaRepository.findById(despesaId)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> despesaService.atualizar(despesaId, criarRequestDTO()));

        assertEquals("Despesa não encontrada", ex.getMessage());
    }

    @Test
    void deveLancarExcecaoDeAcessoNegadoAoAtualizar() {
        UUID usuarioId = UUID.randomUUID();
        UUID outroUsuarioId = UUID.randomUUID();
        UUID despesaId = UUID.randomUUID();

        Despesa despesaDeOutro = criarDespesa(despesaId, outroUsuarioId);

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(despesaRepository.findById(despesaId)).thenReturn(Optional.of(despesaDeOutro));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> despesaService.atualizar(despesaId, criarRequestDTO()));

        assertEquals("Acesso negado", ex.getMessage());
    }

    // ========== DELETAR ==========

    @Test
    void deveDeletarDespesaComSucesso() {
        UUID usuarioId = UUID.randomUUID();
        UUID despesaId = UUID.randomUUID();
        Usuario usuario = criarUsuario(usuarioId);
        Despesa despesa = criarDespesa(despesaId, usuarioId);

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(usuario);
        when(despesaRepository.findById(despesaId)).thenReturn(Optional.of(despesa));

        despesaService.deletar(despesaId);

        verify(despesaRepository, times(1)).delete(despesa);
    }

    @Test
    void deveLancarExcecaoQuandoDespesaNaoEncontradaAoDeletar() {
        UUID usuarioId = UUID.randomUUID();
        UUID despesaId = UUID.randomUUID();

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(despesaRepository.findById(despesaId)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> despesaService.deletar(despesaId));

        assertEquals("Despesa não encontrada", ex.getMessage());
    }

    @Test
    void deveLancarExcecaoDeAcessoNegadoAoDeletar() {
        UUID usuarioId = UUID.randomUUID();
        UUID outroUsuarioId = UUID.randomUUID();
        UUID despesaId = UUID.randomUUID();

        Despesa despesaDeOutro = criarDespesa(despesaId, outroUsuarioId);

        when(authenticatedUserService.getUsuarioLogado()).thenReturn(criarUsuario(usuarioId));
        when(despesaRepository.findById(despesaId)).thenReturn(Optional.of(despesaDeOutro));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> despesaService.deletar(despesaId));

        assertEquals("Acesso negado", ex.getMessage());
    }
}