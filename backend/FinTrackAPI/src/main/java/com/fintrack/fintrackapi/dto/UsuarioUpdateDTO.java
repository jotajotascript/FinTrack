package com.fintrack.fintrackapi.dto;

import lombok.Data;

@Data
public class UsuarioUpdateDTO {
    private String nome;
    private String email;
    private String senha;
}