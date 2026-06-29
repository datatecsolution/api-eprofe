package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.config.CryptoService;
import com.datatecsolution.eprofe.spring_api.config.JwtTokenProvider;
import com.datatecsolution.eprofe.spring_api.model.*;
import com.datatecsolution.eprofe.spring_api.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SeccionController.class)
class SeccionControllerTest {

    
    @Autowired
    private MockMvc mockMvc;

    
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private SeccionRepository seccionRepository;

    @MockitoBean
    private AsignaturaSeccionRepository asignaturaSeccionRepository;

    @MockitoBean
    private ModalidadRepository modalidadRepository;

    @MockitoBean
    private PeriodoRepository periodoRepository;

    @MockitoBean
    private DocenteRepository docenteRepository;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CryptoService cryptoService;

    private Seccion createSeccion(Long id) {
        Seccion s = new Seccion();
        s.setId(id);
        s.setCurso("7mo");
        s.setSeccion("A");
        s.setJornada("Matutina");

        Modalidad mod = new Modalidad();
        mod.setId(1L);
        mod.setNombre("Basica");
        s.setModalidad(mod);

        Centro centro = new Centro();
        centro.setId(1L);
        centro.setNombre("Centro A");
        s.setCentro(centro);

        Periodo periodo = new Periodo();
        periodo.setId(1L);
        s.setPeriodo(periodo);

        return s;
    }

    @Test
    @WithMockUser
    void getAll_returnsList() throws Exception {
        when(seccionRepository.findAll()).thenReturn(List.of(createSeccion(1L), createSeccion(2L)));

        mockMvc.perform(get("/api/secciones"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser
    void getAll_empty() throws Exception {
        when(seccionRepository.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/secciones"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser
    void getById_found() throws Exception {
        when(seccionRepository.findById(1L)).thenReturn(Optional.of(createSeccion(1L)));

        mockMvc.perform(get("/api/secciones/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.curso").value("7mo"));
    }

    @Test
    @WithMockUser
    void getById_notFound() throws Exception {
        when(seccionRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/secciones/999"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser
    void create_success() throws Exception {
        Modalidad mod = new Modalidad();
        mod.setId(1L);
        when(modalidadRepository.getReferenceById(1L)).thenReturn(mod);

        Map<String, Object> payload = Map.of(
                "modalidad_id", 1,
                "curso", "8vo",
                "seccion", "B",
                "jornada", "Vespertina");

        mockMvc.perform(post("/api/secciones")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    void update_success() throws Exception {
        Seccion existing = createSeccion(1L);
        Modalidad mod = new Modalidad();
        mod.setId(1L);

        when(seccionRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(modalidadRepository.getReferenceById(1L)).thenReturn(mod);

        Map<String, Object> payload = Map.of(
                "modalidad_id", 1,
                "curso", "9no",
                "seccion", "A",
                "jornada", "Matutina");

        mockMvc.perform(put("/api/secciones/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    void delete_success() throws Exception {
        when(seccionRepository.findById(1L)).thenReturn(Optional.of(createSeccion(1L)));

        mockMvc.perform(delete("/api/secciones/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    void getSeccionesByDocente_returnsList() throws Exception {
        when(asignaturaSeccionRepository.findSeccionesByDocenteId(1L)).thenReturn(List.of(createSeccion(1L)));

        mockMvc.perform(get("/api/secciones/docente").param("docente_id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser
    void updatePeriodo_success() throws Exception {
        Seccion sec = createSeccion(1L);
        Periodo periodo = new Periodo();
        periodo.setId(2L);

        when(seccionRepository.findById(1L)).thenReturn(Optional.of(sec));
        when(periodoRepository.getReferenceById(2L)).thenReturn(periodo);
        when(seccionRepository.save(any(Seccion.class))).thenReturn(sec);

        List<Map<String, Object>> payload = List.of(
                Map.of("id", 1, "periodo_id", 2));

        mockMvc.perform(put("/api/secciones/update_periodo")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    void updatePeriodo_emptyList() throws Exception {
        mockMvc.perform(put("/api/secciones/update_periodo")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isUnprocessableEntity());
    }
}
