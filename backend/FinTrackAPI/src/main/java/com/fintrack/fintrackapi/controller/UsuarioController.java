package com.fintrack.fintrackapi.controller;

import com.fintrack.fintrackapi.dto.*;
import com.fintrack.fintrackapi.entity.Usuario;
import com.fintrack.fintrackapi.service.UsuarioService;
import com.fintrack.fintrackapi.security.AuthenticatedUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuario")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuthenticatedUserService authenticatedUserService;

    @PostMapping("/register")
    public Usuario cadastrar(@RequestBody UsuarioRequestDTO dto) {
        return usuarioService.cadastrar(dto);
    }

    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginRequestDTO dto) {
        String token = usuarioService.login(dto);
        return new LoginResponseDTO(token);
    }

    @GetMapping("/me")
    public Usuario me() {
        return authenticatedUserService.getUsuarioLogado();
    }
}