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

import java.time.LocalDate;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AsistenciaDetalleController.class)
class AsistenciaDetalleControllerTest {

    
    @Autowired
    private MockMvc mockMvc;

    
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private DetalleAsistenciaRepository detalleRepository;

    @MockitoBean
    private AlumnoRepository alumnoRepository;

    @MockitoBean
    private EncabezadoAsistenciaRepository encabezadoRepository;

    @MockitoBean
    private DocenteRepository docenteRepository;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CryptoService cryptoService;

    private DetalleAsistencia createDetalle(Long id) {
        Modalidad mod = new Modalidad();
        mod.setId(1L);

        Seccion sec = new Seccion();
        sec.setId(1L);
        sec.setModalidad(mod);

        Asignatura asig = new Asignatura();
        asig.setId(1L);

        EncabezadoAsistencia enc = new EncabezadoAsistencia();
        enc.setId(1L);
        enc.setFecha(LocalDate.of(2026, 3, 15));
        enc.setSeccion(sec);
        enc.setAsignatura(asig);

        Alumno alumno = new Alumno();
        alumno.setId(1L);
        alumno.setNombre("Pedro");

        DetalleAsistencia det = new DetalleAsistencia();
        det.setId(id);
        det.setEstado(true);
        det.setAlumno(alumno);
        det.setEncabezadoAsistencia(enc);
        return det;
    }

    @Test
    @WithMockUser
    void getAll_returnsList() throws Exception {
        when(detalleRepository.findAll()).thenReturn(List.of(createDetalle(1L)));

        mockMvc.perform(get("/api/detallesasistencia"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser
    void getAll_empty() throws Exception {
        when(detalleRepository.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/detallesasistencia"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser
    void create_success() throws Exception {
        Alumno alumno = new Alumno();
        alumno.setId(1L);
        EncabezadoAsistencia enc = new EncabezadoAsistencia();
        enc.setId(1L);

        when(alumnoRepository.getReferenceById(1L)).thenReturn(alumno);
        when(encabezadoRepository.getReferenceById(1L)).thenReturn(enc);
        when(detalleRepository.save(any(DetalleAsistencia.class))).thenAnswer(inv -> {
            DetalleAsistencia d = inv.getArgument(0);
            d.setId(1L);
            d.setAlumno(alumno);
            return d;
        });

        Map<String, Object> payload = Map.of(
                "alumno_id", 1,
                "encabezadoasistencia_id", 1,
                "estado", true);

        mockMvc.perform(post("/api/detallesasistencia")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void update_success() throws Exception {
        DetalleAsistencia existing = createDetalle(1L);
        Alumno alumno = new Alumno();
        alumno.setId(1L);
        EncabezadoAsistencia enc = new EncabezadoAsistencia();
        enc.setId(1L);

        when(detalleRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(alumnoRepository.getReferenceById(1L)).thenReturn(alumno);
        when(encabezadoRepository.getReferenceById(1L)).thenReturn(enc);
        when(detalleRepository.save(any(DetalleAsistencia.class))).thenReturn(existing);

        Map<String, Object> payload = Map.of(
                "alumno_id", 1,
                "encabezadoasistencia_id", 1,
                "estado", false);

        mockMvc.perform(put("/api/detallesasistencia/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void update_notFound() throws Exception {
        when(detalleRepository.findById(999L)).thenReturn(Optional.empty());

        Map<String, Object> payload = Map.of(
                "alumno_id", 1,
                "encabezadoasistencia_id", 1,
                "estado", false);

        mockMvc.perform(put("/api/detallesasistencia/999")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isNotFound());
    }
}
