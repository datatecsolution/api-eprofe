package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.Acumulativo;
import com.datatecsolution.eprofe.spring_api.model.NotaAcumulativo;
import com.datatecsolution.eprofe.spring_api.model.Alumno;
import com.datatecsolution.eprofe.spring_api.model.TipoAcumulativo;
import com.datatecsolution.eprofe.spring_api.repository.AcumulativoRepository;
import com.datatecsolution.eprofe.spring_api.repository.NotaAcumulativoRepository;
import com.datatecsolution.eprofe.spring_api.repository.AlumnoRepository;
import com.datatecsolution.eprofe.spring_api.repository.SeccionRepository;
import com.datatecsolution.eprofe.spring_api.repository.AsignaturaRepository;
import com.datatecsolution.eprofe.spring_api.repository.TipoAcumulativoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/acumulativos")
@Tag(name = "Acumulativos", description = "CRUD de evaluaciones acumulativas y consultas por docente")
public class AcumulativoController {

    @Autowired
    private AcumulativoRepository acumulativoRepository;

    @Autowired
    private NotaAcumulativoRepository notaAcumulativoRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private SeccionRepository seccionRepository;

    @Autowired
    private AsignaturaRepository asignaturaRepository;

    @Autowired
    private TipoAcumulativoRepository tipoAcumulativoRepository;

    @Operation(summary = "Listar acumulativos (con paginacion opcional)")
    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "20") Integer size) {
        if (page != null) {
            var paged = acumulativoRepository.findAll(
                    Pageable.ofSize(size).withPage(page));
            initializeRelationships(paged.getContent());
            return ResponseEntity.ok(paged);
        }

        List<Acumulativo> acumulativos = acumulativoRepository.findAll(
                Sort.by(Sort.Direction.DESC, "id"));

        if (acumulativos.isEmpty()) {
            return ResponseEntity.status(422)
                    .body(Map.of("error", true, "msg", "No se encontro ningun acumulativo"));
        }

        initializeRelationships(acumulativos);
        return ResponseEntity.ok(acumulativos);
    }

    @Operation(summary = "Obtener acumulativo por ID con relaciones")
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Optional<Acumulativo> opt = acumulativoRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro ningun acumulativo"));
        }

        Acumulativo a = opt.get();
        initializeRelationships(List.of(a));
        return ResponseEntity.ok(a);
    }

    @Operation(summary = "Crear acumulativo con notas asociadas")
    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload) {
        Acumulativo acumu = new Acumulativo();
        acumu.setSeccion(seccionRepository.getReferenceById(toLong(payload.get("seccion_id"))));
        acumu.setDescripcion((String) payload.get("descripcion"));
        acumu.setTipoAcumulativo(tipoAcumulativoRepository.getReferenceById(toLong(payload.get("tipo_acumulativo_id"))));
        acumu.setFecha(java.time.LocalDate.parse(payload.get("fecha").toString()));
        acumu.setParcial(toInt(payload.get("parcial")));
        acumu.setValor(toDouble(payload.get("valor")));
        acumu.setAsignatura(asignaturaRepository.getReferenceById(toLong(payload.get("asignatura_id"))));

        acumulativoRepository.save(acumu);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> notas = (List<Map<String, Object>>) payload.get("notas_acumulativos");
        if (notas != null) {
            for (Map<String, Object> notaData : notas) {
                NotaAcumulativo nota = new NotaAcumulativo();
                nota.setAlumno(alumnoRepository.getReferenceById(toLong(notaData.get("alumno_id"))));
                nota.setAcumulativo(acumu);
                nota.setNota(toDouble(notaData.get("nota")));
                notaAcumulativoRepository.save(nota);
            }
        }

        return ResponseEntity.ok(acumu);
    }

    @Operation(summary = "Actualizar acumulativo y sus notas")
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<Acumulativo> opt = acumulativoRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(422)
                    .body(Map.of("error", true, "msg", "No se encontro el acumulativo"));
        }

        Acumulativo acumu = opt.get();
        acumu.setDescripcion((String) payload.get("descripcion"));
        acumu.setParcial(toInt(payload.get("parcial")));
        acumu.setValor(toDouble(payload.get("valor")));

        @SuppressWarnings("unchecked")
        Map<String, Object> tipoAcumulativo = (Map<String, Object>) payload.get("tipo_acumulativo");
        if (tipoAcumulativo != null) {
            acumu.setTipoAcumulativo(tipoAcumulativoRepository.getReferenceById(toLong(tipoAcumulativo.get("id"))));
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> notas = (List<Map<String, Object>>) payload.get("notas_acumulativos");
        if (notas != null) {
            for (Map<String, Object> notaData : notas) {
                NotaAcumulativo nota = notaAcumulativoRepository.findById(toLong(notaData.get("id"))).orElse(null);
                if (nota != null) {
                    nota.setAlumno(alumnoRepository.getReferenceById(toLong(notaData.get("alumno_id"))));
                    nota.setAcumulativo(acumulativoRepository.getReferenceById(toLong(notaData.get("acumulativo_id"))));
                    nota.setNota(toDouble(notaData.get("nota")));
                    notaAcumulativoRepository.save(nota);
                }
            }
        }

        acumulativoRepository.save(acumu);
        return ResponseEntity.ok(acumu);
    }

    @Operation(summary = "Eliminar acumulativo")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Optional<Acumulativo> opt = acumulativoRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(422)
                    .body(Map.of("error", true, "msg", "No se encontro el acumulativo"));
        }
        acumulativoRepository.delete(opt.get());
        return ResponseEntity.ok(Map.of("success", true, "msg", "Se elimino el acumulativo"));
    }

    @Operation(summary = "Acumulativos de un docente")
    @GetMapping("/docente")
    public ResponseEntity<?> docente(@RequestParam("docente_id") Long docenteId) {
        List<Acumulativo> acumulativos = acumulativoRepository.findByDocenteId(docenteId);
        if (acumulativos.isEmpty()) {
            return ResponseEntity.status(422)
                    .body(Map.of("error", true, "msg", "No se encontro ningun acumulativo"));
        }
        initializeRelationships(acumulativos);
        return ResponseEntity.ok(acumulativos);
    }

    @Operation(summary = "Acumulativos de un docente en una seccion")
    @GetMapping("/docente_seccion")
    public ResponseEntity<?> docenteSeccion(
            @RequestParam("docente_id") Long docenteId,
            @RequestParam("seccion_id") Long seccionId) {
        List<Acumulativo> acumulativos = acumulativoRepository.findByDocenteIdAndSeccionId(docenteId, seccionId);
        if (acumulativos.isEmpty()) {
            return ResponseEntity.status(422)
                    .body(Map.of("error", true, "msg", "No se encontro ningun acumulativo"));
        }
        // docente_seccion in Laravel loads tipoAcumulativo, seccion.modalidad, notasAcumulativos (no asignatura, no alumno)
        for (Acumulativo a : acumulativos) {
            a.getTipoAcumulativo().getId();
            a.getSeccion().getModalidad().getId();
            if (a.getNotasAcumulativos() != null) {
                a.getNotasAcumulativos().size();
            }
        }
        return ResponseEntity.ok(acumulativos);
    }

    @Operation(summary = "Acumulativos por docente, seccion, parcial y asignatura")
    @GetMapping("/seccion_parcial")
    public ResponseEntity<?> seccionParcial(
            @RequestParam("docente_id") Long docenteId,
            @RequestParam("seccion_id") Long seccionId,
            @RequestParam("parcial") Integer parcial,
            @RequestParam("asignatura_id") Long asignaturaId) {
        List<Acumulativo> acumulativos = acumulativoRepository.findByDocenteSeccionParcialAsignatura(
                docenteId, seccionId, parcial, asignaturaId);
        if (acumulativos.isEmpty()) {
            return ResponseEntity.status(422)
                    .body(Map.of("error", true, "msg", "No se encontro ningun acumulativo"));
        }
        initializeRelationships(acumulativos);
        return ResponseEntity.ok(acumulativos);
    }

    private void initializeRelationships(List<Acumulativo> acumulativos) {
        for (Acumulativo a : acumulativos) {
            a.getTipoAcumulativo().getId();
            a.getAsignatura().getId();
            a.getSeccion().getModalidad().getId();
            if (a.getNotasAcumulativos() != null) {
                for (NotaAcumulativo nota : a.getNotasAcumulativos()) {
                    nota.getAlumno().getId();
                }
            }
        }
    }

    private Long toLong(Object value) {
        return Long.valueOf(value.toString());
    }

    private Integer toInt(Object value) {
        return Integer.valueOf(value.toString());
    }

    private Double toDouble(Object value) {
        return Double.valueOf(value.toString());
    }
}
