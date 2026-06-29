package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.Seccion;
import com.datatecsolution.eprofe.spring_api.repository.AsignaturaSeccionRepository;
import com.datatecsolution.eprofe.spring_api.repository.ModalidadRepository;
import com.datatecsolution.eprofe.spring_api.repository.PeriodoRepository;
import com.datatecsolution.eprofe.spring_api.repository.SeccionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/secciones")
@Tag(name = "Secciones", description = "CRUD de secciones y asignacion de periodos")
public class SeccionController {

    @Autowired
    private SeccionRepository seccionRepository;

    @Autowired
    private AsignaturaSeccionRepository asignaturaSeccionRepository;

    @Autowired
    private ModalidadRepository modalidadRepository;

    @Autowired
    private PeriodoRepository periodoRepository;

    @Operation(summary = "Listar secciones con relaciones")
    @GetMapping
    public ResponseEntity<?> getAll() {
        List<Seccion> secciones = seccionRepository.findAll();
        if (secciones.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro ninguna seccion"));
        }
        for (Seccion s : secciones) {
            s.getModalidad().getId();
            if (s.getPeriodo() != null) s.getPeriodo().getId();
            if (s.getCentro() != null) s.getCentro().getId();
        }
        return ResponseEntity.ok(secciones);
    }

    @Operation(summary = "Obtener seccion por ID")
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Optional<Seccion> opt = seccionRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro la seccion"));
        }
        Seccion s = opt.get();
        s.getModalidad().getId();
        return ResponseEntity.ok(s);
    }

    @Operation(summary = "Crear seccion")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload) {
        Seccion seccion = new Seccion();
        seccion.setModalidad(modalidadRepository.getReferenceById(toLong(payload.get("modalidad_id"))));
        seccion.setCurso((String) payload.get("curso"));
        seccion.setSeccion((String) payload.get("seccion"));
        seccion.setJornada((String) payload.get("jornada"));
        seccionRepository.save(seccion);
        return ResponseEntity.ok(Map.of("success", true, "msg", "Se guardo la seccion"));
    }

    @Operation(summary = "Actualizar seccion")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<Seccion> opt = seccionRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro la seccion"));
        }
        Seccion seccion = opt.get();
        seccion.setModalidad(modalidadRepository.getReferenceById(toLong(payload.get("modalidad_id"))));
        seccion.setCurso((String) payload.get("curso"));
        seccion.setSeccion((String) payload.get("seccion"));
        seccion.setJornada((String) payload.get("jornada"));
        seccionRepository.save(seccion);
        return ResponseEntity.ok(Map.of("success", true, "msg", "Se actualizo la seccion"));
    }

    @Operation(summary = "Eliminar seccion")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Optional<Seccion> opt = seccionRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro la seccion"));
        }
        seccionRepository.delete(opt.get());
        return ResponseEntity.ok(Map.of("success", true, "msg", "Se elimino la seccion"));
    }

    @Operation(summary = "Secciones asignadas a un docente")
    @GetMapping("/docente")
    public List<Seccion> getSeccionesByDocente(@RequestParam("docente_id") Long docenteId) {
        return asignaturaSeccionRepository.findSeccionesByDocenteId(docenteId);
    }

    @Operation(summary = "Actualizar periodo de multiples secciones")
    @PutMapping("/update_periodo")
    @Transactional
    public ResponseEntity<?> updatePeriodo(@RequestBody List<Map<String, Object>> secciones) {
        if (secciones == null || secciones.isEmpty()) {
            return ResponseEntity.status(422)
                    .body(Map.of("error", true, "msg", "No se encontro la seccion"));
        }
        for (Map<String, Object> item : secciones) {
            Seccion seccion = seccionRepository.findById(toLong(item.get("id"))).orElse(null);
            if (seccion != null) {
                seccion.setPeriodo(periodoRepository.getReferenceById(toLong(item.get("periodo_id"))));
                seccionRepository.save(seccion);
            }
        }
        return ResponseEntity.ok(Map.of("success", true, "msg", "Se modifico las secciones"));
    }

    private Long toLong(Object value) {
        return Long.valueOf(value.toString());
    }
}
