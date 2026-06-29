package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.config.CryptoService;
import com.datatecsolution.eprofe.spring_api.config.JwtTokenProvider;
import com.datatecsolution.eprofe.spring_api.model.Asignatura;
import com.datatecsolution.eprofe.spring_api.repository.AsignaturaRepository;
import com.datatecsolution.eprofe.spring_api.repository.DocenteRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AsignaturaController.class)
class AsignaturaControllerTest {

    
    @Autowired
    private MockMvc mockMvc;

    
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private AsignaturaRepository asignaturaRepository;

    @MockitoBean
    private DocenteRepository docenteRepository;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CryptoService cryptoService;

    private Asignatura createAsignatura(Long id, String nombre) {
        Asignatura a = new Asignatura();
        a.setId(id);
        a.setAlias(nombre.substring(0, 3).toUpperCase());
        a.setNombre(nombre);
        a.setTipo("Academica");
        return a;
    }

    @Test
    @WithMockUser
    void getAll_returnsList() throws Exception {
        when(asignaturaRepository.findAll()).thenReturn(List.of(
                createAsignatura(1L, "Matematicas"), createAsignatura(2L, "Espanol")));

        mockMvc.perform(get("/api/asignaturas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser
    void getById_found() throws Exception {
        when(asignaturaRepository.findById(1L)).thenReturn(Optional.of(createAsignatura(1L, "Matematicas")));

        mockMvc.perform(get("/api/asignaturas/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Matematicas"));
    }

    @Test
    @WithMockUser
    void create_success() throws Exception {
        Asignatura asignatura = createAsignatura(null, "Ciencias");

        mockMvc.perform(post("/api/asignaturas")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(asignatura)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    void update_success() throws Exception {
        Asignatura existing = createAsignatura(1L, "Matematicas");
        when(asignaturaRepository.findById(1L)).thenReturn(Optional.of(existing));

        mockMvc.perform(put("/api/asignaturas/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createAsignatura(1L, "Matematicas Avanzadas"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    void delete_success() throws Exception {
        when(asignaturaRepository.findById(1L)).thenReturn(Optional.of(createAsignatura(1L, "Matematicas")));

        mockMvc.perform(delete("/api/asignaturas/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    void buscarPorSeccion_found() throws Exception {
        when(asignaturaRepository.findBySeccionId(1L)).thenReturn(List.of(
                createAsignatura(1L, "Matematicas")));

        mockMvc.perform(get("/api/asignaturas/buscar_asignaturas_seccion")
                        .param("seccion_id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser
    void buscarPorSeccion_empty() throws Exception {
        when(asignaturaRepository.findBySeccionId(999L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/asignaturas/buscar_asignaturas_seccion")
                        .param("seccion_id", "999"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser
    void docenteAsignaturas_found() throws Exception {
        when(asignaturaRepository.findByDocenteIdAndSeccionId(1L, 1L)).thenReturn(List.of(
                createAsignatura(1L, "Matematicas")));

        mockMvc.perform(get("/api/asignaturas/docente")
                        .param("docente_id", "1")
                        .param("seccion_id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }
}
