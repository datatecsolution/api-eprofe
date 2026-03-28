package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.Centro;
import com.datatecsolution.eprofe.spring_api.repository.CentroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/centros")
@CrossOrigin(origins = "*")
public class CentroController {

    @Autowired
    private CentroRepository centroRepository;

    @GetMapping
    public List<Centro> getAll() {
        return centroRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Centro> getById(@PathVariable Long id) {
        Optional<Centro> centro = centroRepository.findById(id);
        return centro.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
