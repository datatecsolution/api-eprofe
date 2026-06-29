package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.Centro;
import com.datatecsolution.eprofe.spring_api.repository.CentroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/centros")
@Tag(name = "Centros", description = "CRUD de centros educativos")
public class CentroController {

    @Autowired
    private CentroRepository centroRepository;

    @Operation(summary = "Listar centros")
    @GetMapping
    public List<Centro> getAll() {
        return centroRepository.findAll();
    }

    @Operation(summary = "Obtener centro por ID")
    @GetMapping("/{id}")
    public ResponseEntity<Centro> getById(@PathVariable Long id) {
        Optional<Centro> centro = centroRepository.findById(id);
        return centro.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Crear centro")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Centro centro) {
        centroRepository.save(centro);
        return ResponseEntity.ok(Map.of("success", true, "msg", "Se guardo el centro"));
    }

    @Operation(summary = "Actualizar centro")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Centro details) {
        Optional<Centro> opt = centroRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro el centro"));
        }
        Centro centro = opt.get();
        centro.setNombre(details.getNombre());
        centro.setCodigoSace(details.getCodigoSace());
        centro.setDireccion(details.getDireccion());
        centro.setTelefono(details.getTelefono());
        centroRepository.save(centro);
        return ResponseEntity.ok(Map.of("success", true, "msg", "Se actualizo el centro"));
    }

    @Operation(summary = "Eliminar centro")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Optional<Centro> opt = centroRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(204)
                    .body(Map.of("error", true, "msg", "No se encontro el centro"));
        }
        centroRepository.delete(opt.get());
        return ResponseEntity.ok(Map.of("success", true, "msg", "Se elimino el centro"));
    }
}
