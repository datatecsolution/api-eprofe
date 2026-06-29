package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.Matricula;
import com.datatecsolution.eprofe.spring_api.repository.MatriculaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matriculas")
@CrossOrigin(origins = "*")
@Tag(name = "Matriculas", description = "Consulta de matriculas")
public class MatriculaController {

    @Autowired
    private MatriculaRepository matriculaRepository;

    @Operation(summary = "Buscar alumnos matriculados por seccion y year")
    @GetMapping("/buscar_seccion_year")
    public List<Matricula> getAlumnosSeccion(@RequestParam("year") Integer year,
            @RequestParam("seccion_id") Long seccionId) {
        // We need a custom query in repository for this
        return matriculaRepository.findBySeccionIdAndYear(seccionId, year);
    }

    @Operation(summary = "Listar todas las matriculas")
    @GetMapping
    public List<Matricula> getAll() {
        return matriculaRepository.findAll();
    }
}
