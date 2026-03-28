package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.Seccion;
import com.datatecsolution.eprofe.spring_api.repository.SeccionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/secciones")
@CrossOrigin(origins = "*")
public class SeccionController {

    @Autowired
    private SeccionRepository seccionRepository;

    @GetMapping
    public List<Seccion> getAll() {
        return seccionRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Seccion> getById(@PathVariable Long id) {
        Optional<Seccion> seccion = seccionRepository.findById(id);
        return seccion.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Autowired
    private com.datatecsolution.eprofe.spring_api.repository.AsignaturaSeccionRepository asignaturaSeccionRepository;

    @GetMapping("/docente")
    public List<Seccion> getSeccionesByDocente(@RequestParam("docente_id") Long docenteId) {
        return asignaturaSeccionRepository.findSeccionesByDocenteId(docenteId);
    }
}
