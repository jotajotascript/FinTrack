package com.fintrack.fintrackapi.service;

import com.fintrack.fintrackapi.dto.LoginRequestDTO;
import com.fintrack.fintrackapi.dto.LoginResponseDTO; 
import com.fintrack.fintrackapi.dto.UsuarioRequestDTO;
import com.fintrack.fintrackapi.dto.UsuarioUpdateDTO;
import com.fintrack.fintrackapi.entity.Usuario;
import com.fintrack.fintrackapi.repository.UsuarioRepository;
import com.fintrack.fintrackapi.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.fintrack.fintrackapi.security.AuthenticatedUserService;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticatedUserService authenticatedUserService;

    public Usuario cadastrar(UsuarioRequestDTO dto) {

        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }

        Usuario usuario = Usuario.builder()
                .nome(dto.getNome())
                .email(dto.getEmail())
                .senha(dto.getSenha() != null ? passwordEncoder.encode(dto.getSenha()) : null)
                .build();

        return usuarioRepository.save(usuario);
    }

    public LoginResponseDTO login(LoginRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!passwordEncoder.matches(dto.getSenha(), usuario.getSenha())) {
            throw new RuntimeException("Senha inválida");
        }

        String token = jwtService.generateToken(usuario.getEmail());
        return new LoginResponseDTO(token, usuario.getNome());
    }

    public void deletar() {
        Usuario usuario = authenticatedUserService.getUsuarioLogado();
        usuarioRepository.delete(usuario);
    }

    public Usuario atualizar(UsuarioUpdateDTO dto) {
        Usuario usuario = authenticatedUserService.getUsuarioLogado();

        if (dto.getNome() != null) {
            usuario.setNome(dto.getNome());
        }

        if (dto.getEmail() != null) {
            if (usuarioRepository.existsByEmail(dto.getEmail()) && !dto.getEmail().equals(usuario.getEmail())) {
                throw new RuntimeException("Email já cadastrado");
            }
            usuario.setEmail(dto.getEmail());
        }

        if (dto.getSenha() != null) {
            usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        }

        return usuarioRepository.save(usuario);
    }
}