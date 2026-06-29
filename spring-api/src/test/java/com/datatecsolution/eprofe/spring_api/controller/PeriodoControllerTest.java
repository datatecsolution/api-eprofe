package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.config.CryptoService;
import com.datatecsolution.eprofe.spring_api.config.JwtTokenProvider;
import com.datatecsolution.eprofe.spring_api.model.Periodo;
import com.datatecsolution.eprofe.spring_api.repository.DocenteRepository;
import com.datatecsolution.eprofe.spring_api.repository.PeriodoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PeriodoController.class)
class PeriodoControllerTest {

    
    @Autowired
    private MockMvc mockMvc;

    
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private PeriodoRepository periodoRepository;

    @MockitoBean
    private DocenteRepository docenteRepository;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CryptoService cryptoService;

    private Periodo createPeriodo(Long id, boolean estado) {
        Periodo p = new Periodo();
        p.setId(id);
        p.setFechaInicio(LocalDate.of(2026, 1, 1));
        p.setFechaFinal(LocalDate.of(2026, 6, 30));
        p.setEstado(estado);
        p.setObservaciones("Periodo " + id);
        return p;
    }

    @Test
    @WithMockUser
    void getAll_defaultReturnsActive() throws Exception {
        when(periodoRepository.findByEstadoTrue()).thenReturn(List.of(createPeriodo(1L, true)));

        mockMvc.perform(get("/api/periodos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser
    void getAll_allParamReturnsAll() throws Exception {
        when(periodoRepository.findAll()).thenReturn(List.of(
                createPeriodo(1L, true), createPeriodo(2L, false)));

        mockMvc.perform(get("/api/periodos").param("all", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser
    void getById_found() throws Exception {
        when(periodoRepository.findById(1L)).thenReturn(Optional.of(createPeriodo(1L, true)));

        mockMvc.perform(get("/api/periodos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value(true));
    }

    @Test
    @WithMockUser
    void getById_notFound() throws Exception {
        when(periodoRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/periodos/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void create_success() throws Exception {
        Periodo periodo = createPeriodo(null, true);
        Periodo saved = createPeriodo(1L, true);

        when(periodoRepository.save(any(Periodo.class))).thenReturn(saved);

        mockMvc.perform(post("/api/periodos")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(periodo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser
    void update_success() throws Exception {
        Periodo existing = createPeriodo(1L, true);
        Periodo updated = createPeriodo(1L, false);

        when(periodoRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(periodoRepository.save(any(Periodo.class))).thenReturn(updated);

        mockMvc.perform(put("/api/periodos/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void delete_success() throws Exception {
        when(periodoRepository.existsById(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/periodos/1").with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void delete_notFound() throws Exception {
        when(periodoRepository.existsById(999L)).thenReturn(false);

        mockMvc.perform(delete("/api/periodos/999").with(csrf()))
                .andExpect(status().isNotFound());
    }
}
