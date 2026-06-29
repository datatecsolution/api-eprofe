package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.Modalidad;
import com.datatecsolution.eprofe.spring_api.repository.ModalidadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/modalidades")
@Tag(name = "Modalidades", description = "CRUD de modalidades educativas")
public class ModalidadController {

    @Autowired
    private ModalidadRepository modalidadRepository;

    @Operation(summary = "Listar modalidades")
    @GetMapping
    public List<Modalidad> getAll() {
        return modalidadRepository.findAll();
    }

    @Operation(summary = "Obtener modalidad por ID")
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Optional<Modalidad> opt = modalidadRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro la modalidad"));
        }
        return ResponseEntity.ok(opt.get());
    }

    @Operation(summary = "Crear modalidad")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Modalidad modalidad) {
        modalidadRepository.save(modalidad);
        return ResponseEntity.ok(Map.of("success", true, "msg", "Se guardo la modalidad"));
    }

    @Operation(summary = "Actualizar modalidad")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Modalidad details) {
        Optional<Modalidad> opt = modalidadRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro la modalidad"));
        }
        Modalidad modalidad = opt.get();
        modalidad.setAlias(details.getAlias());
        modalidad.setNombre(details.getNombre());
        modalidad.setObservaciones(details.getObservaciones());
        modalidadRepository.save(modalidad);
        return ResponseEntity.ok(Map.of("success", true, "msg", "Se actualizo la modalidad"));
    }

    @Operation(summary = "Eliminar modalidad")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Optional<Modalidad> opt = modalidadRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro la modalidad"));
        }
        modalidadRepository.delete(opt.get());
        return ResponseEntity.ok(Map.of("success", true, "msg", "Se elimino la modalidad"));
    }
}
