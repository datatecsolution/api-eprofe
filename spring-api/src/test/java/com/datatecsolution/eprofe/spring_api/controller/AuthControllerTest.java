package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.config.CryptoService;
import com.datatecsolution.eprofe.spring_api.config.JwtTokenProvider;
import com.datatecsolution.eprofe.spring_api.model.Docente;
import com.datatecsolution.eprofe.spring_api.repository.DocenteRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    
    @Autowired
    private MockMvc mockMvc;

    
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private DocenteRepository docenteRepository;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private CryptoService cryptoService;

    @Test
    @WithMockUser
    void login_successWithBcryptPassword() throws Exception {
        Docente docente = new Docente();
        docente.setId(1L);
        docente.setUserSace("teacher1");
        docente.setPassword("$2a$10$hashedPassword");
        docente.setNombre("Juan");
        docente.setApellido("Perez");

        when(docenteRepository.findByUserSace("teacher1")).thenReturn(Optional.of(docente));
        when(passwordEncoder.matches("password123", "$2a$10$hashedPassword")).thenReturn(true);
        when(jwtTokenProvider.generateToken(1L, "teacher1")).thenReturn("test-jwt-token");

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "teacher1",
                                "password", "password123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").value("test-jwt-token"));
    }

    @Test
    @WithMockUser
    void login_successWithSacePassword() throws Exception {
        Docente docente = new Docente();
        docente.setId(2L);
        docente.setUserSace("teacher2");
        docente.setPassword("");
        docente.setPasswordSace("encryptedSacePass");
        docente.setNombre("Maria");
        docente.setApellido("Lopez");

        when(docenteRepository.findByUserSace("teacher2")).thenReturn(Optional.of(docente));
        when(cryptoService.decrypt("encryptedSacePass")).thenReturn("sacePassword");
        when(jwtTokenProvider.generateToken(2L, "teacher2")).thenReturn("test-jwt-token-2");

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "teacher2",
                                "password", "sacePassword"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").value("test-jwt-token-2"));
    }

    @Test
    @WithMockUser
    void login_invalidCredentials() throws Exception {
        Docente docente = new Docente();
        docente.setId(1L);
        docente.setUserSace("teacher1");
        docente.setPassword("$2a$10$hashedPassword");

        when(docenteRepository.findByUserSace("teacher1")).thenReturn(Optional.of(docente));
        when(passwordEncoder.matches("wrongPassword", "$2a$10$hashedPassword")).thenReturn(false);
        when(cryptoService.decrypt(anyString())).thenReturn("notMatching");

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "teacher1",
                                "password", "wrongPassword"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser
    void login_docenteNotFound() throws Exception {
        when(docenteRepository.findByUserSace("nonexistent")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "nonexistent",
                                "password", "password123"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser
    void login_missingUsername() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "password", "password123"))))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @WithMockUser
    void login_missingPassword() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "teacher1"))))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @WithMockUser
    void login_emptyBody() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnprocessableEntity());
    }
}
