package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.Matricula;
import com.datatecsolution.eprofe.spring_api.repository.MatriculaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matriculas")
@CrossOrigin(origins = "*")
public class MatriculaController {

    @Autowired
    private MatriculaRepository matriculaRepository;

    @GetMapping("/buscar_seccion_year")
    public List<Matricula> getAlumnosSeccion(@RequestParam("year") Integer year,
            @RequestParam("seccion_id") Long seccionId) {
        // We need a custom query in repository for this
        return matriculaRepository.findBySeccionIdAndYear(seccionId, year);
    }

    @GetMapping
    public List<Matricula> getAll() {
        return matriculaRepository.findAll();
    }
}
