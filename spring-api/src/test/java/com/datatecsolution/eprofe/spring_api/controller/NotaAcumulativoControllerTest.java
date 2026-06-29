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

@WebMvcTest(NotaAcumulativoController.class)
class NotaAcumulativoControllerTest {

    
    @Autowired
    private MockMvc mockMvc;

    
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private NotaAcumulativoRepository notaRepository;

    @MockitoBean
    private AlumnoRepository alumnoRepository;

    @MockitoBean
    private AcumulativoRepository acumulativoRepository;

    @MockitoBean
    private DocenteRepository docenteRepository;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CryptoService cryptoService;

    private NotaAcumulativo createNota(Long id, Double nota) {
        NotaAcumulativo n = new NotaAcumulativo();
        n.setId(id);
        n.setNota(nota);

        Alumno alumno = new Alumno();
        alumno.setId(1L);
        alumno.setNombre("Pedro");
        n.setAlumno(alumno);

        Acumulativo acum = new Acumulativo();
        acum.setId(1L);
        n.setAcumulativo(acum);

        return n;
    }

    @Test
    @WithMockUser
    void getAll_returnsList() throws Exception {
        when(notaRepository.findAll()).thenReturn(List.of(createNota(1L, 85.0), createNota(2L, 90.0)));

        mockMvc.perform(get("/api/notaacumulativos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser
    void getById_found() throws Exception {
        when(notaRepository.findById(1L)).thenReturn(Optional.of(createNota(1L, 85.0)));

        mockMvc.perform(get("/api/notaacumulativos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nota").value(85.0));
    }

    @Test
    @WithMockUser
    void getById_notFound() throws Exception {
        when(notaRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/notaacumulativos/999"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser
    void create_success() throws Exception {
        Alumno alumno = new Alumno();
        alumno.setId(1L);
        Acumulativo acum = new Acumulativo();
        acum.setId(1L);

        when(alumnoRepository.getReferenceById(1L)).thenReturn(alumno);
        when(acumulativoRepository.getReferenceById(1L)).thenReturn(acum);
        when(notaRepository.save(any(NotaAcumulativo.class))).thenAnswer(inv -> {
            NotaAcumulativo n = inv.getArgument(0);
            n.setId(1L);
            return n;
        });

        Map<String, Object> payload = Map.of(
                "alumno_id", 1,
                "acumulativo_id", 1,
                "nota", 95.0);

        mockMvc.perform(post("/api/notaacumulativos")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void delete_success() throws Exception {
        when(notaRepository.findById(1L)).thenReturn(Optional.of(createNota(1L, 85.0)));

        mockMvc.perform(delete("/api/notaacumulativos/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    void delete_notFound() throws Exception {
        when(notaRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/notaacumulativos/999").with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser
    void actualizarNotas_success() throws Exception {
        Alumno alumno = new Alumno();
        alumno.setId(1L);
        Acumulativo acum = new Acumulativo();
        acum.setId(1L);

        when(alumnoRepository.findById(1L)).thenReturn(Optional.of(alumno));
        when(acumulativoRepository.findById(1L)).thenReturn(Optional.of(acum));
        when(notaRepository.findByAlumnoAndAcumulativo(alumno, acum)).thenReturn(Optional.of(createNota(1L, 80.0)));
        when(notaRepository.save(any(NotaAcumulativo.class))).thenReturn(createNota(1L, 95.0));

        Map<String, Object> payload = Map.of(
                "alumnoId", 1,
                "acumulativoId", 1,
                "nota", 95.0);

        mockMvc.perform(post("/api/notaacumulativos/actualizar_notas")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    void actualizarNotas_alumnoNotFound() throws Exception {
        when(alumnoRepository.findById(999L)).thenReturn(Optional.empty());
        when(acumulativoRepository.findById(1L)).thenReturn(Optional.of(new Acumulativo()));

        Map<String, Object> payload = Map.of(
                "alumnoId", 999,
                "acumulativoId", 1,
                "nota", 95.0);

        mockMvc.perform(post("/api/notaacumulativos/actualizar_notas")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser
    void buscarAsignatura_found() throws Exception {
        when(notaRepository.findByAlumnoAsignaturaParcialSeccion(1L, 1L, 1, 1L))
                .thenReturn(List.of(createNota(1L, 85.0)));

        mockMvc.perform(get("/api/notaacumulativos/buscar_asignatura")
                        .param("alumno_id", "1")
                        .param("asignatura_id", "1")
                        .param("parcial", "1")
                        .param("seccion_id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser
    void buscarAsignatura_empty() throws Exception {
        when(notaRepository.findByAlumnoAsignaturaParcialSeccion(999L, 999L, 1, 999L))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/notaacumulativos/buscar_asignatura")
                        .param("alumno_id", "999")
                        .param("asignatura_id", "999")
                        .param("parcial", "1")
                        .param("seccion_id", "999"))
                .andExpect(status().isUnprocessableEntity());
    }
}
