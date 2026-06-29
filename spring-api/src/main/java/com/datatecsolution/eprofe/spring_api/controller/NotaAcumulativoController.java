package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.dto.NotaUpdateDTO;
import com.datatecsolution.eprofe.spring_api.model.Acumulativo;
import com.datatecsolution.eprofe.spring_api.model.Alumno;
import com.datatecsolution.eprofe.spring_api.model.NotaAcumulativo;
import com.datatecsolution.eprofe.spring_api.repository.AcumulativoRepository;
import com.datatecsolution.eprofe.spring_api.repository.AlumnoRepository;
import com.datatecsolution.eprofe.spring_api.repository.NotaAcumulativoRepository;
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
@RequestMapping("/api/notaacumulativos")
@Tag(name = "Notas Acumulativas", description = "CRUD de notas y consultas por asignatura")
public class NotaAcumulativoController {

    @Autowired
    private NotaAcumulativoRepository notaRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private AcumulativoRepository acumulativoRepository;

    @Operation(summary = "Listar todas las notas")
    @GetMapping
    public List<NotaAcumulativo> getAll() {
        return notaRepository.findAll();
    }

    @Operation(summary = "Obtener nota por ID")
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Optional<NotaAcumulativo> opt = notaRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro ninguna nota"));
        }
        NotaAcumulativo nota = opt.get();
        nota.getAlumno().getId();
        nota.getAcumulativo().getId();
        return ResponseEntity.ok(nota);
    }

    @Operation(summary = "Crear nota acumulativa")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload) {
        NotaAcumulativo nota = new NotaAcumulativo();
        nota.setAlumno(alumnoRepository.getReferenceById(toLong(payload.get("alumno_id"))));
        nota.setAcumulativo(acumulativoRepository.getReferenceById(toLong(payload.get("acumulativo_id"))));
        nota.setNota(Double.valueOf(payload.get("nota").toString()));
        notaRepository.save(nota);
        return ResponseEntity.ok(nota);
    }

    @Operation(summary = "Actualizar nota")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<NotaAcumulativo> opt = notaRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro la nota"));
        }
        NotaAcumulativo nota = opt.get();
        nota.setAlumno(alumnoRepository.getReferenceById(toLong(payload.get("alumno_id"))));
        nota.setAcumulativo(acumulativoRepository.getReferenceById(toLong(payload.get("acumulativo_id"))));
        nota.setNota(Double.valueOf(payload.get("nota").toString()));
        notaRepository.save(nota);
        return ResponseEntity.ok(nota);
    }

    @Operation(summary = "Eliminar nota")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Optional<NotaAcumulativo> opt = notaRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro la nota"));
        }
        notaRepository.delete(opt.get());
        return ResponseEntity.ok(Map.of("success", true, "msg", "Se elimino la nota"));
    }

    @Operation(summary = "Actualizar o crear nota por alumno/acumulativo")
    @PostMapping("/actualizar_notas")
    public ResponseEntity<?> updateNota(@RequestBody NotaUpdateDTO dto) {
        Optional<Alumno> alumnoOpt = alumnoRepository.findById(dto.getAlumnoId());
        Optional<Acumulativo> acumulativoOpt = acumulativoRepository.findById(dto.getAcumulativoId());

        if (alumnoOpt.isEmpty() || acumulativoOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Alumno or Acumulativo not found", "success", false));
        }

        Optional<NotaAcumulativo> existingNota = notaRepository.findByAlumnoAndAcumulativo(alumnoOpt.get(),
                acumulativoOpt.get());
        NotaAcumulativo nota;

        if (existingNota.isPresent()) {
            nota = existingNota.get();
        } else {
            nota = new NotaAcumulativo();
            nota.setAlumno(alumnoOpt.get());
            nota.setAcumulativo(acumulativoOpt.get());
        }

        nota.setNota(dto.getNota());
        if (dto.getMovilId() != null) {
            nota.setMovilId(dto.getMovilId());
        }

        notaRepository.save(nota);

        return ResponseEntity.ok().body(Map.of("message", "Nota updated successfully", "success", true));
    }

    @Operation(summary = "Buscar notas por alumno, asignatura, parcial y seccion")
    @GetMapping("/buscar_asignatura")
    public ResponseEntity<?> buscarAsignatura(
            @RequestParam("alumno_id") Long alumnoId,
            @RequestParam("asignatura_id") Long asignaturaId,
            @RequestParam("parcial") Integer parcial,
            @RequestParam("seccion_id") Long seccionId) {

        List<NotaAcumulativo> notas = notaRepository.findByAlumnoAsignaturaParcialSeccion(
                alumnoId, asignaturaId, parcial, seccionId);

        if (notas.isEmpty()) {
            return ResponseEntity.status(422)
                    .body(Map.of("error", true, "msg", "No se encontro ninguna nota"));
        }

        for (NotaAcumulativo n : notas) {
            n.getAlumno().getId();
            n.getAcumulativo().getId();
        }

        return ResponseEntity.ok(notas);
    }

    private Long toLong(Object value) {
        return Long.valueOf(value.toString());
    }
}
