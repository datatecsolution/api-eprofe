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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AcumulativoController.class)
class AcumulativoControllerTest {

    
    @Autowired
    private MockMvc mockMvc;

    
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private AcumulativoRepository acumulativoRepository;

    @MockitoBean
    private NotaAcumulativoRepository notaAcumulativoRepository;

    @MockitoBean
    private AlumnoRepository alumnoRepository;

    @MockitoBean
    private SeccionRepository seccionRepository;

    @MockitoBean
    private AsignaturaRepository asignaturaRepository;

    @MockitoBean
    private TipoAcumulativoRepository tipoAcumulativoRepository;

    @MockitoBean
    private DocenteRepository docenteRepository;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CryptoService cryptoService;

    private Acumulativo createAcumulativo(Long id) {
        Acumulativo a = new Acumulativo();
        a.setId(id);
        a.setDescripcion("Examen parcial " + id);
        a.setFecha(LocalDate.of(2026, 3, 15));
        a.setParcial(1);
        a.setValor(20.0);

        TipoAcumulativo tipo = new TipoAcumulativo();
        tipo.setId(1L);
        tipo.setDescripcion("Examen");
        a.setTipoAcumulativo(tipo);

        Asignatura asig = new Asignatura();
        asig.setId(1L);
        asig.setNombre("Matematicas");
        a.setAsignatura(asig);

        Modalidad mod = new Modalidad();
        mod.setId(1L);
        mod.setNombre("Basica");

        Seccion sec = new Seccion();
        sec.setId(1L);
        sec.setCurso("7mo");
        sec.setSeccion("A");
        sec.setModalidad(mod);
        a.setSeccion(sec);

        a.setNotasAcumulativos(new ArrayList<>());
        return a;
    }

    @Test
    @WithMockUser
    void getAll_returnsList() throws Exception {
        when(acumulativoRepository.findAll(any(Sort.class))).thenReturn(List.of(
                createAcumulativo(1L), createAcumulativo(2L)));

        mockMvc.perform(get("/api/acumulativos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser
    void getAll_empty() throws Exception {
        when(acumulativoRepository.findAll(any(Sort.class))).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/acumulativos"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value(true));
    }

    @Test
    @WithMockUser
    void getById_found() throws Exception {
        when(acumulativoRepository.findById(1L)).thenReturn(Optional.of(createAcumulativo(1L)));

        mockMvc.perform(get("/api/acumulativos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.descripcion").value("Examen parcial 1"));
    }

    @Test
    @WithMockUser
    void getById_notFound() throws Exception {
        when(acumulativoRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/acumulativos/999"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser
    void create_success() throws Exception {
        Seccion seccion = new Seccion();
        seccion.setId(1L);
        Asignatura asig = new Asignatura();
        asig.setId(1L);
        TipoAcumulativo tipo = new TipoAcumulativo();
        tipo.setId(1L);

        when(seccionRepository.getReferenceById(1L)).thenReturn(seccion);
        when(asignaturaRepository.getReferenceById(1L)).thenReturn(asig);
        when(tipoAcumulativoRepository.getReferenceById(1L)).thenReturn(tipo);
        when(acumulativoRepository.save(any(Acumulativo.class))).thenAnswer(inv -> {
            Acumulativo a = inv.getArgument(0);
            a.setId(1L);
            return a;
        });

        Map<String, Object> payload = new HashMap<>();
        payload.put("seccion_id", 1);
        payload.put("descripcion", "Nuevo examen");
        payload.put("tipo_acumulativo_id", 1);
        payload.put("fecha", "2026-03-20");
        payload.put("parcial", 1);
        payload.put("valor", 25.0);
        payload.put("asignatura_id", 1);

        mockMvc.perform(post("/api/acumulativos")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void delete_success() throws Exception {
        when(acumulativoRepository.findById(1L)).thenReturn(Optional.of(createAcumulativo(1L)));

        mockMvc.perform(delete("/api/acumulativos/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    void delete_notFound() throws Exception {
        when(acumulativoRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/acumulativos/999").with(csrf()))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @WithMockUser
    void docente_found() throws Exception {
        when(acumulativoRepository.findByDocenteId(1L)).thenReturn(List.of(createAcumulativo(1L)));

        mockMvc.perform(get("/api/acumulativos/docente").param("docente_id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser
    void docente_empty() throws Exception {
        when(acumulativoRepository.findByDocenteId(999L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/acumulativos/docente").param("docente_id", "999"))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @WithMockUser
    void docenteSeccion_found() throws Exception {
        Acumulativo acum = createAcumulativo(1L);
        when(acumulativoRepository.findByDocenteIdAndSeccionId(1L, 1L)).thenReturn(List.of(acum));

        mockMvc.perform(get("/api/acumulativos/docente_seccion")
                        .param("docente_id", "1")
                        .param("seccion_id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser
    void seccionParcial_found() throws Exception {
        when(acumulativoRepository.findByDocenteSeccionParcialAsignatura(1L, 1L, 1, 1L))
                .thenReturn(List.of(createAcumulativo(1L)));

        mockMvc.perform(get("/api/acumulativos/seccion_parcial")
                        .param("docente_id", "1")
                        .param("seccion_id", "1")
                        .param("parcial", "1")
                        .param("asignatura_id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }
}
