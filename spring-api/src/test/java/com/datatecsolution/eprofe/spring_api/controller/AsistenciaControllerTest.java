package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.config.CryptoService;
import com.datatecsolution.eprofe.spring_api.config.JwtTokenProvider;
import com.datatecsolution.eprofe.spring_api.model.*;
import com.datatecsolution.eprofe.spring_api.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AsistenciaController.class)
class AsistenciaControllerTest {

    
    @Autowired
    private MockMvc mockMvc;

    
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private EncabezadoAsistenciaRepository encabezadoRepository;

    @MockitoBean
    private DetalleAsistenciaRepository detalleRepository;

    @MockitoBean
    private AlumnoRepository alumnoRepository;

    @MockitoBean
    private SeccionRepository seccionRepository;

    @MockitoBean
    private AsignaturaRepository asignaturaRepository;

    @MockitoBean
    private DocenteRepository docenteRepository;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CryptoService cryptoService;

    private EncabezadoAsistencia createEncabezado(Long id) {
        EncabezadoAsistencia e = new EncabezadoAsistencia();
        e.setId(id);
        e.setFecha(LocalDate.of(2026, 3, 15));

        Modalidad mod = new Modalidad();
        mod.setId(1L);
        mod.setNombre("Basica");

        Seccion sec = new Seccion();
        sec.setId(1L);
        sec.setCurso("7mo");
        sec.setModalidad(mod);
        e.setSeccion(sec);

        Asignatura asig = new Asignatura();
        asig.setId(1L);
        asig.setNombre("Matematicas");
        e.setAsignatura(asig);

        Alumno alumno = new Alumno();
        alumno.setId(1L);
        alumno.setNombre("Pedro");

        DetalleAsistencia det = new DetalleAsistencia();
        det.setId(1L);
        det.setEstado(true);
        det.setAlumno(alumno);
        det.setEncabezadoAsistencia(e);

        e.setDetalles(List.of(det));
        return e;
    }

    @Test
    @WithMockUser
    void getAll_returnsList() throws Exception {
        when(encabezadoRepository.findAll(any(Sort.class))).thenReturn(List.of(createEncabezado(1L)));

        mockMvc.perform(get("/api/asistencias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser
    void getAll_empty() throws Exception {
        when(encabezadoRepository.findAll(any(Sort.class))).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/asistencias"))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @WithMockUser
    void getById_found() throws Exception {
        when(encabezadoRepository.findById(1L)).thenReturn(Optional.of(createEncabezado(1L)));

        mockMvc.perform(get("/api/asistencias/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser
    void getById_notFound() throws Exception {
        when(encabezadoRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/asistencias/999"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser
    void create_success() throws Exception {
        Seccion seccion = new Seccion();
        seccion.setId(1L);
        Asignatura asig = new Asignatura();
        asig.setId(1L);
        Alumno alumno = new Alumno();
        alumno.setId(1L);

        when(seccionRepository.getReferenceById(1L)).thenReturn(seccion);
        when(asignaturaRepository.getReferenceById(1L)).thenReturn(asig);
        when(alumnoRepository.getReferenceById(1L)).thenReturn(alumno);
        when(encabezadoRepository.save(any(EncabezadoAsistencia.class))).thenAnswer(inv -> {
            EncabezadoAsistencia e = inv.getArgument(0);
            e.setId(1L);
            return e;
        });

        Map<String, Object> payload = new HashMap<>();
        payload.put("seccion_id", 1);
        payload.put("asignatura_id", 1);
        payload.put("fecha", "2026-03-20");
        payload.put("detalles_asistencia", List.of(
                Map.of("alumno_id", 1, "estado", true, "excusa", false)));

        mockMvc.perform(post("/api/asistencias")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void delete_success() throws Exception {
        when(encabezadoRepository.findById(1L)).thenReturn(Optional.of(createEncabezado(1L)));

        mockMvc.perform(delete("/api/asistencias/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    void delete_notFound() throws Exception {
        when(encabezadoRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/asistencias/999").with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser
    void docente_found() throws Exception {
        EncabezadoAsistencia enc = createEncabezado(1L);
        when(encabezadoRepository.findByDocenteIdAndSeccionId(1L, 1L)).thenReturn(List.of(enc));

        mockMvc.perform(get("/api/asistencias/docente")
                        .param("docente_id", "1")
                        .param("seccion_id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser
    void docente_empty() throws Exception {
        when(encabezadoRepository.findByDocenteIdAndSeccionId(999L, 999L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/asistencias/docente")
                        .param("docente_id", "999")
                        .param("seccion_id", "999"))
                .andExpect(status().isUnprocessableEntity());
    }
}
