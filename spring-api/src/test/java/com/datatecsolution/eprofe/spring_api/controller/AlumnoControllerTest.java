package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.config.CryptoService;
import com.datatecsolution.eprofe.spring_api.config.JwtTokenProvider;
import com.datatecsolution.eprofe.spring_api.model.Alumno;
import com.datatecsolution.eprofe.spring_api.repository.AlumnoRepository;
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
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AlumnoController.class)
class AlumnoControllerTest {

    
    @Autowired
    private MockMvc mockMvc;

    
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private AlumnoRepository alumnoRepository;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private DocenteRepository docenteRepository;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CryptoService cryptoService;

    private Alumno createAlumno(Long id, String nombre, String apellido) {
        Alumno alumno = new Alumno();
        alumno.setId(id);
        alumno.setNombre(nombre);
        alumno.setApellido(apellido);
        alumno.setRne("RNE-" + id);
        alumno.setEmail(nombre.toLowerCase() + "@test.com");
        return alumno;
    }

    @Test
    @WithMockUser
    void getAll_returnsList() throws Exception {
        when(alumnoRepository.findAll()).thenReturn(List.of(
                createAlumno(1L, "Juan", "Perez"),
                createAlumno(2L, "Maria", "Lopez")));

        mockMvc.perform(get("/api/alumnos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nombre").value("Juan"));
    }

    @Test
    @WithMockUser
    void getById_found() throws Exception {
        when(alumnoRepository.findById(1L)).thenReturn(Optional.of(createAlumno(1L, "Juan", "Perez")));

        mockMvc.perform(get("/api/alumnos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Juan"));
    }

    @Test
    @WithMockUser
    void getById_notFound() throws Exception {
        when(alumnoRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/alumnos/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void create_success() throws Exception {
        Alumno alumno = createAlumno(null, "Pedro", "Garcia");
        alumno.setPassword("secret123");
        Alumno saved = createAlumno(1L, "Pedro", "Garcia");

        when(passwordEncoder.encode("secret123")).thenReturn("$2a$10$hashed");
        when(alumnoRepository.save(any(Alumno.class))).thenReturn(saved);

        mockMvc.perform(post("/api/alumnos")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(alumno)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nombre").value("Pedro"));
    }

    @Test
    @WithMockUser
    void update_success() throws Exception {
        Alumno existing = createAlumno(1L, "Juan", "Perez");
        Alumno updated = createAlumno(1L, "Juan Carlos", "Perez");

        when(alumnoRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(alumnoRepository.save(any(Alumno.class))).thenReturn(updated);

        mockMvc.perform(put("/api/alumnos/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Juan Carlos"));
    }

    @Test
    @WithMockUser
    void update_notFound() throws Exception {
        when(alumnoRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/alumnos/999")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createAlumno(999L, "Test", "Test"))))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void delete_success() throws Exception {
        when(alumnoRepository.existsById(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/alumnos/1").with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void delete_notFound() throws Exception {
        when(alumnoRepository.existsById(999L)).thenReturn(false);

        mockMvc.perform(delete("/api/alumnos/999").with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAll_unauthenticated() throws Exception {
        mockMvc.perform(get("/api/alumnos"))
                .andExpect(status().isUnauthorized());
    }
}
