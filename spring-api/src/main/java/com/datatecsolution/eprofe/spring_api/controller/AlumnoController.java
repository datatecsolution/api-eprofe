package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.Alumno;
import com.datatecsolution.eprofe.spring_api.repository.AlumnoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/alumnos")
@CrossOrigin(origins = "*")
@Tag(name = "Alumnos", description = "CRUD de alumnos")
public class AlumnoController {

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Operation(summary = "Listar alumnos (con paginacion opcional)")
    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "20") Integer size) {
        if (page != null) {
            return ResponseEntity.ok(alumnoRepository.findAll(Pageable.ofSize(size).withPage(page)));
        }
        return ResponseEntity.ok(alumnoRepository.findAll());
    }

    @Operation(summary = "Obtener alumno por ID")
    @GetMapping("/{id}")
    public ResponseEntity<Alumno> getById(@PathVariable Long id) {
        Optional<Alumno> alumno = alumnoRepository.findById(id);
        return alumno.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Crear alumno")
    @PostMapping
    public Alumno create(@RequestBody Alumno alumno) {
        if (alumno.getPassword() != null && !alumno.getPassword().isBlank()) {
            alumno.setPassword(passwordEncoder.encode(alumno.getPassword()));
        }
        return alumnoRepository.save(alumno);
    }

    @Operation(summary = "Actualizar alumno")
    @PutMapping("/{id}")
    public ResponseEntity<Alumno> update(@PathVariable Long id, @RequestBody Alumno alumnoDetails) {
        Optional<Alumno> alumnoOptional = alumnoRepository.findById(id);
        if (alumnoOptional.isPresent()) {
            Alumno alumno = alumnoOptional.get();
            alumno.setNombre(alumnoDetails.getNombre());
            alumno.setApellido(alumnoDetails.getApellido());
            alumno.setRne(alumnoDetails.getRne());
            alumno.setGenero(alumnoDetails.getGenero());
            alumno.setEmail(alumnoDetails.getEmail());
            alumno.setTelefono(alumnoDetails.getTelefono());
            if (alumnoDetails.getPassword() != null && !alumnoDetails.getPassword().isEmpty()) {
                alumno.setPassword(passwordEncoder.encode(alumnoDetails.getPassword()));
            }
            return ResponseEntity.ok(alumnoRepository.save(alumno));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Eliminar alumno")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (alumnoRepository.existsById(id)) {
            alumnoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
