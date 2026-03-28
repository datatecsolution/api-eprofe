package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.EncabezadoAsistencia;
import com.datatecsolution.eprofe.spring_api.repository.EncabezadoAsistenciaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/asistencias")
@CrossOrigin(origins = "*")
public class AsistenciaController {

    @Autowired
    private EncabezadoAsistenciaRepository encabezadoRepository;

    @GetMapping
    public List<EncabezadoAsistencia> getAll() {
        return encabezadoRepository.findAll();
    }

    // Additional endpoints for creating attendance records would go here
    // For now, exposing basic CRUD
}
