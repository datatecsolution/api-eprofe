package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.DetalleAsistencia;
import com.datatecsolution.eprofe.spring_api.repository.AlumnoRepository;
import com.datatecsolution.eprofe.spring_api.repository.DetalleAsistenciaRepository;
import com.datatecsolution.eprofe.spring_api.repository.EncabezadoAsistenciaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/detallesasistencia")
@Tag(name = "Detalles Asistencia", description = "CRUD de detalles individuales de asistencia")
public class AsistenciaDetalleController {

    @Autowired
    private DetalleAsistenciaRepository detalleRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private EncabezadoAsistenciaRepository encabezadoRepository;

    @Operation(summary = "Listar detalles de asistencia")
    @GetMapping
    public ResponseEntity<?> getAll() {
        List<DetalleAsistencia> detalles = detalleRepository.findAll();
        if (detalles.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro ningun detalle"));
        }

        for (DetalleAsistencia d : detalles) {
            d.getEncabezadoAsistencia().getSeccion().getId();
            d.getEncabezadoAsistencia().getAsignatura().getId();
            d.getAlumno().getId();
        }

        return ResponseEntity.ok(detalles);
    }

    @Operation(summary = "Crear detalle de asistencia")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload) {
        DetalleAsistencia detalle = new DetalleAsistencia();
        detalle.setAlumno(alumnoRepository.getReferenceById(toLong(payload.get("alumno_id"))));
        detalle.setEncabezadoAsistencia(encabezadoRepository.getReferenceById(toLong(payload.get("encabezadoasistencia_id"))));
        detalle.setEstado(toBoolean(payload.get("estado")));

        detalleRepository.save(detalle);

        detalle.getAlumno().getId();
        return ResponseEntity.ok(detalle);
    }

    @Operation(summary = "Actualizar detalle de asistencia")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<DetalleAsistencia> opt = detalleRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        DetalleAsistencia detalle = opt.get();
        detalle.setAlumno(alumnoRepository.getReferenceById(toLong(payload.get("alumno_id"))));
        detalle.setEncabezadoAsistencia(encabezadoRepository.getReferenceById(toLong(payload.get("encabezadoasistencia_id"))));
        detalle.setEstado(toBoolean(payload.get("estado")));

        detalleRepository.save(detalle);
        return ResponseEntity.ok(detalle);
    }

    private Long toLong(Object value) {
        return Long.valueOf(value.toString());
    }

    private Boolean toBoolean(Object value) {
        if (value instanceof Boolean) return (Boolean) value;
        if (value instanceof Number) return ((Number) value).intValue() != 0;
        return Boolean.parseBoolean(value.toString());
    }
}
