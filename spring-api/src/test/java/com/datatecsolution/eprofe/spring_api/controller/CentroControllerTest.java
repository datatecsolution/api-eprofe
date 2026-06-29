package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.config.CryptoService;
import com.datatecsolution.eprofe.spring_api.config.JwtTokenProvider;
import com.datatecsolution.eprofe.spring_api.model.Centro;
import com.datatecsolution.eprofe.spring_api.repository.CentroRepository;
import com.datatecsolution.eprofe.spring_api.repository.DocenteRepository;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CentroController.class)
class CentroControllerTest {

    
    @Autowired
    private MockMvc mockMvc;

    
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private CentroRepository centroRepository;

    @MockitoBean
    private DocenteRepository docenteRepository;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CryptoService cryptoService;

    private Centro createCentro(Long id, String nombre) {
        Centro centro = new Centro();
        centro.setId(id);
        centro.setNombre(nombre);
        centro.setCodigoSace("SACE-" + id);
        centro.setDireccion("Calle Test");
        centro.setTelefono("99887766");
        return centro;
    }

    @Test
    @WithMockUser
    void getAll_returnsList() throws Exception {
        when(centroRepository.findAll()).thenReturn(List.of(
                createCentro(1L, "Centro A"), createCentro(2L, "Centro B")));

        mockMvc.perform(get("/api/centros"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser
    void getById_found() throws Exception {
        when(centroRepository.findById(1L)).thenReturn(Optional.of(createCentro(1L, "Centro A")));

        mockMvc.perform(get("/api/centros/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Centro A"));
    }

    @Test
    @WithMockUser
    void getById_notFound() throws Exception {
        when(centroRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/centros/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void create_success() throws Exception {
        Centro centro = createCentro(null, "Nuevo Centro");

        mockMvc.perform(post("/api/centros")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(centro)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    void update_success() throws Exception {
        Centro existing = createCentro(1L, "Centro A");
        Centro updated = createCentro(1L, "Centro Actualizado");

        when(centroRepository.findById(1L)).thenReturn(Optional.of(existing));

        mockMvc.perform(put("/api/centros/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    void delete_success() throws Exception {
        when(centroRepository.findById(1L)).thenReturn(Optional.of(createCentro(1L, "Centro A")));

        mockMvc.perform(delete("/api/centros/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
