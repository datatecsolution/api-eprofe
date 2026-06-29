package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.Seccion;
import com.datatecsolution.eprofe.spring_api.service.SaceSyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usersace")
@CrossOrigin(origins = "*")
@Tag(name = "SACE Sync", description = "Sincronizacion de datos con el SACE")
public class SaceSyncController {

    @Autowired
    private SaceSyncService saceSyncService;

    @Operation(summary = "Sincronizar datos del docente desde el SACE")
    @PostMapping("/sicronizar")
    public ResponseEntity<?> sincronizar(@RequestBody Map<String, Object> payload) {
        try {
            Long docenteId = Long.valueOf(payload.get("id").toString());
            String cookies = (String) payload.get("cookies");

            System.out.println("--- SINC START ---");
            System.out.println("Cookies received: " + cookies);
            try {
                java.nio.file.Files.writeString(java.nio.file.Paths.get("sace_cookies_debug.txt"),
                        cookies != null ? cookies : "null");
            } catch (Exception e) {
            }

            if (cookies == null || cookies.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "400", "msg", "Cookies are required for synchronization"));
            }

            Map<String, Object> syncData = saceSyncService.synchronize(docenteId, cookies);
            return ResponseEntity.ok(syncData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "500", "msg", e.getMessage()));
        }
    }
}
