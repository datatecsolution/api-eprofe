package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.TipoAcumulativo;
import com.datatecsolution.eprofe.spring_api.repository.TipoAcumulativoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipoacumlativos") // Mispelling intentional to match legacy API if strict
@CrossOrigin(origins = "*")
public class TipoAcumulativoController {

    @Autowired
    private TipoAcumulativoRepository tipoAcumulativoRepository;

    @GetMapping
    public List<TipoAcumulativo> getAll() {
        return tipoAcumulativoRepository.findAll();
    }
}
