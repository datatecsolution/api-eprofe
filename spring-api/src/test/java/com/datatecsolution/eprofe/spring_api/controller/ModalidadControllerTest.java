package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.config.CryptoService;
import com.datatecsolution.eprofe.spring_api.config.JwtTokenProvider;
import com.datatecsolution.eprofe.spring_api.model.Modalidad;
import com.datatecsolution.eprofe.spring_api.repository.DocenteRepository;
import com.datatecsolution.eprofe.spring_api.repository.ModalidadRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ModalidadController.class)
class ModalidadControllerTest {

    
    @Autowired
    private MockMvc mockMvc;

    
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private ModalidadRepository modalidadRepository;

    @MockitoBean
    private DocenteRepository docenteRepository;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CryptoService cryptoService;

    private Modalidad createModalidad(Long id, String nombre) {
        Modalidad m = new Modalidad();
        m.setId(id);
        m.setAlias(nombre.substring(0, 3).toUpperCase());
        m.setNombre(nombre);
        m.setObservaciones("Obs " + nombre);
        return m;
    }

    @Test
    @WithMockUser
    void getAll_returnsList() throws Exception {
        when(modalidadRepository.findAll()).thenReturn(List.of(
                createModalidad(1L, "Basica"), createModalidad(2L, "Media")));

        mockMvc.perform(get("/api/modalidades"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser
    void getById_found() throws Exception {
        when(modalidadRepository.findById(1L)).thenReturn(Optional.of(createModalidad(1L, "Basica")));

        mockMvc.perform(get("/api/modalidades/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Basica"));
    }

    @Test
    @WithMockUser
    void create_success() throws Exception {
        mockMvc.perform(post("/api/modalidades")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createModalidad(null, "PreBasica"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    void update_success() throws Exception {
        when(modalidadRepository.findById(1L)).thenReturn(Optional.of(createModalidad(1L, "Basica")));

        mockMvc.perform(put("/api/modalidades/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createModalidad(1L, "Basica Actualizada"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    void delete_success() throws Exception {
        when(modalidadRepository.findById(1L)).thenReturn(Optional.of(createModalidad(1L, "Basica")));

        mockMvc.perform(delete("/api/modalidades/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
