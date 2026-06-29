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

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DocenteController.class)
class DocenteControllerTest {

    
    @Autowired
    private MockMvc mockMvc;

    
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private DocenteRepository docenteRepository;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private CryptoService cryptoService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    private Docente createDocente(Long id, String nombre) {
        Docente docente = new Docente();
        docente.setId(id);
        docente.setNombre(nombre);
        docente.setApellido("Test");
        docente.setUserSace("user_" + id);
        return docente;
    }

    @Test
    @WithMockUser
    void getAll_returnsList() throws Exception {
        when(docenteRepository.findAll()).thenReturn(List.of(
                createDocente(1L, "Juan"), createDocente(2L, "Maria")));

        mockMvc.perform(get("/api/docentes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser
    void getById_found() throws Exception {
        when(docenteRepository.findById(1L)).thenReturn(Optional.of(createDocente(1L, "Juan")));

        mockMvc.perform(get("/api/docentes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Juan"));
    }

    @Test
    @WithMockUser
    void getById_notFound() throws Exception {
        when(docenteRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/docentes/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void create_encryptsPasswords() throws Exception {
        Docente docente = createDocente(null, "Pedro");
        docente.setPassword("appPassword");
        docente.setPasswordSace("sacePassword");

        Docente saved = createDocente(1L, "Pedro");

        when(passwordEncoder.encode("appPassword")).thenReturn("$2a$10$hashed");
        when(cryptoService.encrypt("sacePassword")).thenReturn("encryptedSace");
        when(docenteRepository.save(any(Docente.class))).thenReturn(saved);

        mockMvc.perform(post("/api/docentes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(docente)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser
    void update_success() throws Exception {
        Docente existing = createDocente(1L, "Juan");
        Docente updated = createDocente(1L, "Juan Carlos");
        updated.setPasswordSace("newSacePass");

        when(docenteRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(cryptoService.encrypt(anyString())).thenReturn("encrypted");
        when(docenteRepository.save(any(Docente.class))).thenReturn(updated);

        mockMvc.perform(put("/api/docentes/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void delete_success() throws Exception {
        when(docenteRepository.existsById(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/docentes/1").with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void delete_notFound() throws Exception {
        when(docenteRepository.existsById(999L)).thenReturn(false);

        mockMvc.perform(delete("/api/docentes/999").with(csrf()))
                .andExpect(status().isNotFound());
    }
}
