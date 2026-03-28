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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notaacumulativos")
@CrossOrigin(origins = "*")
public class NotaAcumulativoController {

    @Autowired
    private NotaAcumulativoRepository notaRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private AcumulativoRepository acumulativoRepository;

    @GetMapping
    public List<NotaAcumulativo> getAll() {
        return notaRepository.findAll();
    }

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
}
