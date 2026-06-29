package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.TipoAcumulativo;
import com.datatecsolution.eprofe.spring_api.repository.TipoAcumulativoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipoacumlativos") // Mispelling intentional to match legacy API if strict
@CrossOrigin(origins = "*")
@Tag(name = "Tipos Acumulativo", description = "Consulta de tipos de evaluacion")
public class TipoAcumulativoController {

    @Autowired
    private TipoAcumulativoRepository tipoAcumulativoRepository;

    @Operation(summary = "Listar todos los tipos de acumulativo")
    @GetMapping
    public List<TipoAcumulativo> getAll() {
        return tipoAcumulativoRepository.findAll();
    }
}
