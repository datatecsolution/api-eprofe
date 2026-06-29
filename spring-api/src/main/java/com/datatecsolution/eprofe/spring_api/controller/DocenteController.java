package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.config.CryptoService;
import com.datatecsolution.eprofe.spring_api.model.Docente;
import com.datatecsolution.eprofe.spring_api.repository.DocenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/docentes")
@CrossOrigin(origins = "*")
@Tag(name = "Docentes", description = "CRUD de docentes")
public class DocenteController {

    @Autowired
    private DocenteRepository docenteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CryptoService cryptoService;

    @Operation(summary = "Listar docentes")
    @GetMapping
    public List<Docente> getAll() {
        return docenteRepository.findAll();
    }

    @Operation(summary = "Obtener docente por ID")
    @GetMapping("/{id}")
    public ResponseEntity<Docente> getById(@PathVariable Long id) {
        Optional<Docente> docente = docenteRepository.findById(id);
        return docente.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Crear docente")
    @PostMapping
    public Docente create(@RequestBody Docente docente) {
        if (docente.getPassword() != null && !docente.getPassword().isBlank()) {
            docente.setPassword(passwordEncoder.encode(docente.getPassword()));
        }
        if (docente.getPasswordSace() != null && !docente.getPasswordSace().isBlank()) {
            docente.setPasswordSace(cryptoService.encrypt(docente.getPasswordSace()));
        }
        return docenteRepository.save(docente);
    }

    @Operation(summary = "Actualizar docente")
    @PutMapping("/{id}")
    public ResponseEntity<Docente> update(@PathVariable Long id, @RequestBody Docente docenteDetails) {
        Optional<Docente> docenteOptional = docenteRepository.findById(id);
        if (docenteOptional.isPresent()) {
            Docente docente = docenteOptional.get();
            docente.setNombre(docenteDetails.getNombre());
            docente.setApellido(docenteDetails.getApellido());
            docente.setDireccion(docenteDetails.getDireccion());
            docente.setEmail(docenteDetails.getEmail());
            docente.setTelefono(docenteDetails.getTelefono());
            docente.setUserSace(docenteDetails.getUserSace());
            if (docenteDetails.getPasswordSace() != null && !docenteDetails.getPasswordSace().isBlank()) {
                docente.setPasswordSace(cryptoService.encrypt(docenteDetails.getPasswordSace()));
            }

            return ResponseEntity.ok(docenteRepository.save(docente));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Eliminar docente")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (docenteRepository.existsById(id)) {
            docenteRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
