package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.Periodo;
import com.datatecsolution.eprofe.spring_api.repository.PeriodoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/periodos")
@CrossOrigin(origins = "*")
public class PeriodoController {

    @Autowired
    private PeriodoRepository periodoRepository;

    @GetMapping
    public List<Periodo> getAll() {
        return periodoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Periodo> getById(@PathVariable Long id) {
        Optional<Periodo> periodo = periodoRepository.findById(id);
        return periodo.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Periodo create(@RequestBody Periodo periodo) {
        return periodoRepository.save(periodo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Periodo> update(@PathVariable Long id, @RequestBody Periodo periodoDetails) {
        Optional<Periodo> periodoOpt = periodoRepository.findById(id);
        if (periodoOpt.isPresent()) {
            Periodo periodo = periodoOpt.get();
            periodo.setFechaInicio(periodoDetails.getFechaInicio());
            periodo.setFechaFinal(periodoDetails.getFechaFinal());
            periodo.setEstado(periodoDetails.getEstado());
            periodo.setObservaciones(periodoDetails.getObservaciones());
            return ResponseEntity.ok(periodoRepository.save(periodo));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (periodoRepository.existsById(id)) {
            periodoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
