package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.Asignatura;
import com.datatecsolution.eprofe.spring_api.repository.AsignaturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/asignaturas")
@CrossOrigin(origins = "*")
public class AsignaturaController {

    @Autowired
    private AsignaturaRepository asignaturaRepository;

    @GetMapping
    public List<Asignatura> getAll() {
        return asignaturaRepository.findAll();
    }

    @PostMapping
    public Asignatura create(@RequestBody Asignatura asignatura) {
        return asignaturaRepository.save(asignatura);
    }

    // Additional CRUD methods as needed
}
