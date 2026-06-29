package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.config.CryptoService;
import com.datatecsolution.eprofe.spring_api.config.JwtTokenProvider;
import com.datatecsolution.eprofe.spring_api.model.Docente;
import com.datatecsolution.eprofe.spring_api.repository.AsignaturaSeccionRepository;
import com.datatecsolution.eprofe.spring_api.repository.DocenteRepository;
import com.datatecsolution.eprofe.spring_api.service.ExcelExportService;
import com.datatecsolution.eprofe.spring_api.service.SaceScraperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/sace")
@CrossOrigin(origins = "*")
@Tag(name = "SACE", description = "Login SACE, subida y preview de notas")
public class SaceController {

    @Autowired
    private DocenteRepository docenteRepository;

    @Autowired
    private AsignaturaSeccionRepository asignaturaSeccionRepository;

    @Autowired
    private ExcelExportService excelExportService;

    @Autowired
    private SaceScraperService saceScraperService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private CryptoService cryptoService;

    @Operation(summary = "Login de docente via SACE")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String cookies = payload.get("cookies");
        String username = payload.get("username");
        String password = payload.get("password");

        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is required", "success", false));
        }

        // Find or create docente
        Optional<Docente> docenteOpt = docenteRepository.findByUserSace(username);
        Docente docente;

        if (docenteOpt.isPresent()) {
            docente = docenteOpt.get();
            // Update password if provided and different
            if (password != null && !password.isBlank()) {
                String decrypted = cryptoService.decrypt(docente.getPasswordSace());
                if (!password.equals(decrypted)) {
                    docente.setPasswordSace(cryptoService.encrypt(password));
                    docenteRepository.save(docente);
                }
            }
        } else {
            // Only create new docente if cookies are provided (SACE sync needed)
            if (cookies == null || cookies.isBlank()) {
                return ResponseEntity.ok().body(Map.of(
                    "message", "Docente not found. SACE sync required.",
                    "success", false,
                    "needsSaceSync", true
                ));
            }
            docente = new Docente();
            docente.setUserSace(username);
            docente.setPasswordSace(password != null ? cryptoService.encrypt(password) : "");
            docente.setNombre("SACE");
            docente.setApellido("Docente");
            docente = docenteRepository.save(docente);
        }

        // Check if docente has synced data in active periodos
        boolean hasData = !asignaturaSeccionRepository.findByDocenteAndPeriodoActivo(docente).isEmpty();

        String token = jwtTokenProvider.generateToken(docente.getId(), docente.getUserSace());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("success", true);
        response.put("token", token);
        response.put("docente", docente);
        response.put("hasData", hasData);
        response.put("needsSaceSync", !hasData);

        return ResponseEntity.ok().body(response);
    }

    /**
     * Endpoint para subir notas al SACE.
     * Flujo: buscar Excel original → rellenarlo con notas → subirlo al SACE.
     *
     * Request body:
     * {
     *   "docenteId": Long,
     *   "seccionId": Long,
     *   "asignaturaId": Long,
     *   "parcial": Integer (1-4),
     *   "cookies": String (cookies de sesion SACE del WebView, opcional si ya logueado)
     * }
     */
    @Operation(summary = "Subir notas al SACE")
    @PostMapping("/subir-notas")
    public ResponseEntity<?> subirNotas(@RequestBody Map<String, Object> payload) {
        try {
            Long docenteId = Long.valueOf(payload.get("docenteId").toString());
            Long seccionId = Long.valueOf(payload.get("seccionId").toString());
            Long asignaturaId = Long.valueOf(payload.get("asignaturaId").toString());
            Integer parcial = Integer.valueOf(payload.get("parcial").toString());

            // 1. Validar docente
            Optional<Docente> docenteOpt = docenteRepository.findById(docenteId);
            if (docenteOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Docente no encontrado"));
            }
            Docente docente = docenteOpt.get();

            // 2. Rellenar el Excel original con las notas
            byte[] filledExcel = excelExportService.fillExcelWithGrades(
                    docente.getUserSace(), seccionId, asignaturaId, parcial);

            // 3. Login al SACE si se proporcionan cookies
            String cookies = payload.get("cookies") != null ? payload.get("cookies").toString() : null;
            if (cookies != null && !cookies.isBlank()) {
                saceScraperService.setCookies(cookies);
            } else {
                // Intentar login con credenciales del docente
                boolean loggedIn = saceScraperService.login(
                        docente.getUserSace(), cryptoService.decrypt(docente.getPasswordSace()));
                if (!loggedIn) {
                    return ResponseEntity.status(401)
                            .body(Map.of("success", false,
                                    "message", "No se pudo iniciar sesion en el SACE. Proporcione cookies validas."));
                }
            }

            // 4. Subir el archivo rellenado al SACE
            String fileName = seccionId + "_" + asignaturaId + "_parcial" + parcial + ".xls";
            boolean uploaded = saceScraperService.uploadExcelFile(filledExcel, fileName);

            if (uploaded) {
                return ResponseEntity.ok()
                        .body(Map.of("success", true,
                                "message", "Notas subidas exitosamente al SACE"));
            } else {
                return ResponseEntity.internalServerError()
                        .body(Map.of("success", false,
                                "message", "Error al subir el archivo al SACE"));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false,
                            "message", "Error: " + e.getMessage()));
        }
    }

    /**
     * Endpoint para descargar el Excel rellenado con notas (sin subir al SACE).
     * Util para que el docente revise el archivo antes de subirlo.
     */
    @Operation(summary = "Preview del Excel con notas sin subir al SACE")
    @PostMapping("/preview-notas")
    public ResponseEntity<?> previewNotas(@RequestBody Map<String, Object> payload) {
        try {
            Long docenteId = Long.valueOf(payload.get("docenteId").toString());
            Long seccionId = Long.valueOf(payload.get("seccionId").toString());
            Long asignaturaId = Long.valueOf(payload.get("asignaturaId").toString());
            Integer parcial = Integer.valueOf(payload.get("parcial").toString());

            Optional<Docente> docenteOpt = docenteRepository.findById(docenteId);
            if (docenteOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Docente no encontrado"));
            }

            byte[] filledExcel = excelExportService.fillExcelWithGrades(
                    docenteOpt.get().getUserSace(), seccionId, asignaturaId, parcial);

            String fileName = seccionId + "_" + asignaturaId + "_parcial" + parcial + ".xls";

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                    .header("Content-Type", "application/vnd.ms-excel")
                    .body(filledExcel);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Error: " + e.getMessage()));
        }
    }
}
