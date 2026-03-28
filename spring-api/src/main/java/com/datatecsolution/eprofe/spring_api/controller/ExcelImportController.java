package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.model.Docente;
import com.datatecsolution.eprofe.spring_api.repository.DocenteRepository;
import com.datatecsolution.eprofe.spring_api.service.ExcelImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/excel")
@CrossOrigin(origins = "*")
public class ExcelImportController {

    @Autowired
    private ExcelImportService excelImportService;

    @Autowired
    private DocenteRepository docenteRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file,
            @RequestParam("docenteId") Long docenteId) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please select a file to upload.", "success", false));
        }

        Optional<Docente> docenteOpt = docenteRepository.findById(docenteId);
        if (docenteOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Docente not found with ID: " + docenteId, "success", false));
        }

        try {
            excelImportService.processExcelFile(file.getInputStream(), docenteOpt.get());
            return ResponseEntity.ok().body(Map.of("message", "File processed successfully!", "success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Error processing file: " + e.getMessage(), "success", false));
        }
    }
}
