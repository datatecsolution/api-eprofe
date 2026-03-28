package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.Docente;
import com.datatecsolution.eprofe.spring_api.repository.DocenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private DocenteRepository docenteRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body("Username and password are required");
        }

        // Check against userSace and passwordSace
        Optional<Docente> docenteOpt = docenteRepository.findByUserSace(username);

        if (docenteOpt.isPresent()) {
            Docente docente = docenteOpt.get();
            // In a real app, use hashed passwords. Here we compare plain text as they are
            // needed for SACE scraping defined in the legacy logic.
            if (password.equals(docente.getPasswordSace())) {
                return ResponseEntity.ok(docente);
            }
        }

        return ResponseEntity.status(401).body("Invalid credentials");
    }
}
