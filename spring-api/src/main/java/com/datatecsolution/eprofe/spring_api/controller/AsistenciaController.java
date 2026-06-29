package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.DetalleAsistencia;
import com.datatecsolution.eprofe.spring_api.model.EncabezadoAsistencia;
import com.datatecsolution.eprofe.spring_api.repository.AlumnoRepository;
import com.datatecsolution.eprofe.spring_api.repository.DetalleAsistenciaRepository;
import com.datatecsolution.eprofe.spring_api.repository.EncabezadoAsistenciaRepository;
import com.datatecsolution.eprofe.spring_api.repository.SeccionRepository;
import com.datatecsolution.eprofe.spring_api.repository.AsignaturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/asistencias")
@Tag(name = "Asistencias", description = "CRUD de registros de asistencia")
public class AsistenciaController {

    @Autowired
    private EncabezadoAsistenciaRepository encabezadoRepository;

    @Autowired
    private DetalleAsistenciaRepository detalleRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private SeccionRepository seccionRepository;

    @Autowired
    private AsignaturaRepository asignaturaRepository;

    @Operation(summary = "Listar asistencias con detalles")
    @GetMapping
    public ResponseEntity<?> getAll() {
        List<EncabezadoAsistencia> asistencias = encabezadoRepository.findAll(
                Sort.by(Sort.Direction.DESC, "fecha"));

        if (asistencias.isEmpty()) {
            return ResponseEntity.status(422)
                    .body(Map.of("error", true, "msg", "No se encontro ninguna asistencia"));
        }

        initializeRelationships(asistencias);
        return ResponseEntity.ok(asistencias);
    }

    @Operation(summary = "Obtener asistencia por ID")
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Optional<EncabezadoAsistencia> opt = encabezadoRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro ninguna asistencia"));
        }

        EncabezadoAsistencia a = opt.get();
        initializeRelationships(List.of(a));
        return ResponseEntity.ok(a);
    }

    @Operation(summary = "Crear asistencia con detalles de alumnos")
    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload) {
        EncabezadoAsistencia encabezado = new EncabezadoAsistencia();
        encabezado.setSeccion(seccionRepository.getReferenceById(toLong(payload.get("seccion_id"))));
        encabezado.setAsignatura(asignaturaRepository.getReferenceById(toLong(payload.get("asignatura_id"))));
        encabezado.setFecha(LocalDate.parse(payload.get("fecha").toString()));

        encabezadoRepository.save(encabezado);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> detalles = (List<Map<String, Object>>) payload.get("detalles_asistencia");
        if (detalles != null) {
            for (Map<String, Object> det : detalles) {
                DetalleAsistencia detalle = new DetalleAsistencia();
                detalle.setAlumno(alumnoRepository.getReferenceById(toLong(det.get("alumno_id"))));
                detalle.setEncabezadoAsistencia(encabezado);
                detalle.setEstado(toBoolean(det.get("estado")));
                detalle.setExcusa(det.get("excusa") != null ? toBoolean(det.get("excusa")) : false);
                detalleRepository.save(detalle);
            }
        }

        return ResponseEntity.ok(encabezado);
    }

    @Operation(summary = "Actualizar fecha y detalles de asistencia")
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<EncabezadoAsistencia> opt = encabezadoRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(422)
                    .body(Map.of("error", true, "msg", "No se encontro la asistencia"));
        }

        EncabezadoAsistencia encabezado = opt.get();
        encabezado.setFecha(LocalDate.parse(payload.get("fecha").toString()));
        encabezadoRepository.save(encabezado);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> detalles = (List<Map<String, Object>>) payload.get("detalles_asistencia");
        if (detalles != null) {
            for (Map<String, Object> det : detalles) {
                DetalleAsistencia detalle = detalleRepository.findById(toLong(det.get("id"))).orElse(null);
                if (detalle != null) {
                    detalle.setEstado(toBoolean(det.get("estado")));
                    detalle.setExcusa(det.get("excusa") != null ? toBoolean(det.get("excusa")) : false);
                    detalleRepository.save(detalle);
                }
            }
        }

        return ResponseEntity.ok(encabezado);
    }

    @Operation(summary = "Eliminar asistencia")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Optional<EncabezadoAsistencia> opt = encabezadoRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro la asistencia"));
        }
        encabezadoRepository.delete(opt.get());
        return ResponseEntity.ok(Map.of("success", true, "msg", "Se elimino la asistencia"));
    }

    @Operation(summary = "Asistencias de un docente en una seccion")
    @GetMapping("/docente")
    public ResponseEntity<?> docente(
            @RequestParam("docente_id") Long docenteId,
            @RequestParam("seccion_id") Long seccionId) {
        List<EncabezadoAsistencia> asistencias = encabezadoRepository.findByDocenteIdAndSeccionId(docenteId, seccionId);
        if (asistencias.isEmpty()) {
            return ResponseEntity.status(422)
                    .body(Map.of("error", true, "msg", "No se encontro ninguna asistencia"));
        }
        // Laravel loads detallesAsistencia, seccion.modalidad, asignatura (no alumno in detalles)
        for (EncabezadoAsistencia a : asistencias) {
            a.getSeccion().getModalidad().getId();
            a.getAsignatura().getId();
            if (a.getDetalles() != null) {
                a.getDetalles().size();
            }
        }
        return ResponseEntity.ok(asistencias);
    }

    private void initializeRelationships(List<EncabezadoAsistencia> asistencias) {
        for (EncabezadoAsistencia a : asistencias) {
            a.getSeccion().getModalidad().getId();
            a.getAsignatura().getId();
            if (a.getDetalles() != null) {
                for (DetalleAsistencia d : a.getDetalles()) {
                    d.getAlumno().getId();
                }
            }
        }
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
