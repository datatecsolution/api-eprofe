package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.Asignatura;
import com.datatecsolution.eprofe.spring_api.repository.AsignaturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/asignaturas")
@Tag(name = "Asignaturas", description = "CRUD y consultas de asignaturas")
public class AsignaturaController {

    @Autowired
    private AsignaturaRepository asignaturaRepository;

    @Operation(summary = "Listar asignaturas")
    @GetMapping
    public List<Asignatura> getAll() {
        return asignaturaRepository.findAll();
    }

    @Operation(summary = "Obtener asignatura por ID")
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Optional<Asignatura> opt = asignaturaRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro la asignatura"));
        }
        return ResponseEntity.ok(opt.get());
    }

    @Operation(summary = "Crear asignatura")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Asignatura asignatura) {
        asignaturaRepository.save(asignatura);
        return ResponseEntity.ok(Map.of("success", true, "msg", "Se guardo la asignatura"));
    }

    @Operation(summary = "Actualizar asignatura")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Asignatura details) {
        Optional<Asignatura> opt = asignaturaRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro la asignatura"));
        }
        Asignatura asignatura = opt.get();
        asignatura.setAlias(details.getAlias());
        asignatura.setNombre(details.getNombre());
        asignatura.setTipo(details.getTipo());
        asignaturaRepository.save(asignatura);
        return ResponseEntity.ok(Map.of("success", true, "msg", "Se actualizo la asignatura"));
    }

    @Operation(summary = "Eliminar asignatura")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Optional<Asignatura> opt = asignaturaRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro la asignatura"));
        }
        asignaturaRepository.delete(opt.get());
        return ResponseEntity.ok(Map.of("success", true, "msg", "Se elimino la asignatura"));
    }

    @Operation(summary = "Buscar asignaturas por seccion")
    @GetMapping("/buscar_asignaturas_seccion")
    public ResponseEntity<?> buscarPorSeccion(@RequestParam("seccion_id") Long seccionId) {
        List<Asignatura> asignaturas = asignaturaRepository.findBySeccionId(seccionId);
        if (asignaturas.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro la asignatura"));
        }
        return ResponseEntity.ok(asignaturas);
    }

    @Operation(summary = "Asignaturas del docente en seccion con periodo activo")
    @GetMapping("/docente")
    public ResponseEntity<?> docenteAsignaturas(
            @RequestParam("docente_id") Long docenteId,
            @RequestParam("seccion_id") Long seccionId) {
        List<Asignatura> asignaturas = asignaturaRepository.findByDocenteIdAndSeccionId(docenteId, seccionId);
        if (asignaturas.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro la asignatura"));
        }
        return ResponseEntity.ok(asignaturas);
    }
}
