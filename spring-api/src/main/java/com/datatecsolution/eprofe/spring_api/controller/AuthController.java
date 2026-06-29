package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.config.CryptoService;
import com.datatecsolution.eprofe.spring_api.config.JwtTokenProvider;
import com.datatecsolution.eprofe.spring_api.dto.ApiResponse;
import com.datatecsolution.eprofe.spring_api.dto.LoginRequest;
import com.datatecsolution.eprofe.spring_api.model.Docente;
import com.datatecsolution.eprofe.spring_api.repository.DocenteRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticacion", description = "Login y obtencion de token JWT")
public class AuthController {

    @Autowired
    private DocenteRepository docenteRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CryptoService cryptoService;

    @Operation(summary = "Login de docente", description = "Autentica con userSace/password y retorna token JWT")
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest credentials) {
        String username = credentials.getUsername();
        String password = credentials.getPassword();

        Optional<Docente> docenteOpt = docenteRepository.findByUserSace(username);

        if (docenteOpt.isPresent()) {
            Docente docente = docenteOpt.get();

            // Check against BCrypt password if set, otherwise fall back to passwordSace
            boolean authenticated = false;
            if (docente.getPassword() != null && !docente.getPassword().isBlank()) {
                authenticated = passwordEncoder.matches(password, docente.getPassword());
            } else {
                String decryptedSace = cryptoService.decrypt(docente.getPasswordSace());
                authenticated = password.equals(decryptedSace);
            }

            if (authenticated) {
                String token = jwtTokenProvider.generateToken(docente.getId(), docente.getUserSace());

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("token", token);
                response.put("docente", docente);
                return ResponseEntity.ok(response);
            }
        }

        return ResponseEntity.status(401)
                .body(Map.of("success", false, "message", "Invalid credentials"));
    }
}
