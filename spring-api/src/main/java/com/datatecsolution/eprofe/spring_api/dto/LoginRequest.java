package com.datatecsolution.eprofe.spring_api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "El username es requerido")
    private String username;

    @NotBlank(message = "El password es requerido")
    private String password;
}
