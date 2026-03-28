package com.datatecsolution.eprofe.spring_api.service;

import com.datatecsolution.eprofe.spring_api.model.Docente;
import com.datatecsolution.eprofe.spring_api.model.Seccion;
import com.datatecsolution.eprofe.spring_api.model.Asignatura;
import com.datatecsolution.eprofe.spring_api.model.AsignaturaSeccion;
import com.datatecsolution.eprofe.spring_api.model.Alumno;
import com.datatecsolution.eprofe.spring_api.model.Matricula;
import com.datatecsolution.eprofe.spring_api.model.Periodo;
import com.datatecsolution.eprofe.spring_api.model.TipoAcumulativo;
import com.datatecsolution.eprofe.spring_api.repository.AsignaturaSeccionRepository;
import com.datatecsolution.eprofe.spring_api.repository.DocenteRepository;
import com.datatecsolution.eprofe.spring_api.repository.MatriculaRepository;
import com.datatecsolution.eprofe.spring_api.repository.TipoAcumulativoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SaceSyncService {

    @Autowired
    private SaceScraperService saceScraperService;

    @Autowired
    private ExcelImportService excelImportService;

    @Autowired
    private DocenteRepository docenteRepository;

    @Autowired
    private AsignaturaSeccionRepository asignaturaSeccionRepository;

    @Autowired
    private MatriculaRepository matriculaRepository;

    @Autowired
    private TipoAcumulativoRepository tipoAcumulativoRepository;

    @Transactional
    public Map<String, Object> synchronize(Long docenteId, String jsonBase64Files) throws Exception {
        // 1. Fetch Docente
        Optional<Docente> docenteOpt = docenteRepository.findById(docenteId);
        if (docenteOpt.isEmpty()) {
            throw new RuntimeException("Docente not found with ID: " + docenteId);
        }
        Docente docente = docenteOpt.get();

        // 2. Parse JSON Payload from Mobile App
        ObjectMapper mapper = new ObjectMapper();
        List<Map<String, String>> fileEntries = mapper.readValue(jsonBase64Files,
                new TypeReference<List<Map<String, String>>>() {
                });

        if (fileEntries == null || fileEntries.isEmpty()) {
            throw new RuntimeException("No files received from SACE Webview.");
        }

        // 3. Decode Base64, Process Files, and Store Originals on Disk
        for (Map<String, String> entry : fileEntries) {
            String base64Content = entry.get("base64");
            if (base64Content != null && !base64Content.isEmpty()) {
                byte[] content = Base64.getDecoder().decode(base64Content);
                excelImportService.processAndStoreExcelFile(content, docente);
            }
        }

        // 5. Gather all related data for the offline mobile app
        List<AsignaturaSeccion> asignaciones = asignaturaSeccionRepository.findByDocente(docente);
        List<Seccion> secciones = asignaciones.stream()
                .map(AsignaturaSeccion::getSeccion)
                .distinct()
                .collect(Collectors.toList());

        List<Asignatura> asignaturas = asignaciones.stream()
                .map(AsignaturaSeccion::getAsignatura)
                .distinct()
                .collect(Collectors.toList());

        int currentYear = java.time.Year.now().getValue();
        List<Matricula> matriculas = new ArrayList<>();
        for (Seccion sec : secciones) {
            matriculas.addAll(matriculaRepository.findBySeccionIdAndYear(sec.getId(), currentYear));
        }

        List<Alumno> alumnos = matriculas.stream()
                .map(Matricula::getAlumno)
                .distinct()
                .collect(Collectors.toList());

        // Periodos from secciones
        List<Periodo> periodos = secciones.stream()
                .map(Seccion::getPeriodo)
                .filter(p -> p != null)
                .distinct()
                .collect(Collectors.toList());

        // Tipo acumulativos (global catalog)
        List<TipoAcumulativo> tipoAcumulativos = tipoAcumulativoRepository.findAll();

        Map<String, Object> result = new HashMap<>();
        result.put("secciones", secciones);
        result.put("asignaturas", asignaturas);
        result.put("asignaturas_secciones", asignaciones);
        result.put("matriculas", matriculas);
        result.put("alumnos", alumnos);
        result.put("periodos", periodos);
        result.put("tipo_acumulativos", tipoAcumulativos);

        return result;
    }
}
