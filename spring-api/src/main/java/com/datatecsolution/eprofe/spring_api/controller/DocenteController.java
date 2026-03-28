package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.Docente;
import com.datatecsolution.eprofe.spring_api.repository.DocenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/docentes")
@CrossOrigin(origins = "*")
public class DocenteController {

    @Autowired
    private DocenteRepository docenteRepository;

    @GetMapping
    public List<Docente> getAll() {
        return docenteRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Docente> getById(@PathVariable Long id) {
        Optional<Docente> docente = docenteRepository.findById(id);
        return docente.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Docente create(@RequestBody Docente docente) {
        return docenteRepository.save(docente);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Docente> update(@PathVariable Long id, @RequestBody Docente docenteDetails) {
        Optional<Docente> docenteOptional = docenteRepository.findById(id);
        if (docenteOptional.isPresent()) {
            Docente docente = docenteOptional.get();
            docente.setNombre(docenteDetails.getNombre());
            docente.setApellido(docenteDetails.getApellido());
            docente.setDireccion(docenteDetails.getDireccion());
            docente.setEmail(docenteDetails.getEmail());
            docente.setTelefono(docenteDetails.getTelefono());
            docente.setUserSace(docenteDetails.getUserSace());
            docente.setPasswordSace(docenteDetails.getPasswordSace());

            return ResponseEntity.ok(docenteRepository.save(docente));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (docenteRepository.existsById(id)) {
            docenteRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
