package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.dto.DocenteSyncDTO;
import com.datatecsolution.eprofe.spring_api.model.*;
import com.datatecsolution.eprofe.spring_api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sync")
@CrossOrigin(origins = "*")
public class AppSyncController {

    @Autowired
    private DocenteRepository docenteRepository;

    @Autowired
    private AsignaturaSeccionRepository asignaturaSeccionRepository;

    @Autowired
    private MatriculaRepository matriculaRepository;

    @Autowired
    private TipoAcumulativoRepository tipoAcumulativoRepository;

    @Autowired
    private AcumulativoRepository acumulativoRepository;

    @Autowired
    private NotaAcumulativoRepository notaAcumulativoRepository;

    @Autowired
    private PeriodoRepository periodoRepository;

    @Transactional(readOnly = true)
    @GetMapping("/initial/{docenteId}")
    public ResponseEntity<DocenteSyncDTO> getInitialData(@PathVariable Long docenteId) {
        Optional<Docente> docenteOpt = docenteRepository.findById(docenteId);

        if (docenteOpt.isPresent()) {
            Docente docente = docenteOpt.get();

            List<Centro> centros = docente.getCentros();

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

            // Fetch tipo_acumulativos (global catalog)
            List<TipoAcumulativo> tipoAcumulativos = tipoAcumulativoRepository.findAll();

            // Fetch acumulativos for the teacher's sections and subjects
            List<Acumulativo> acumulativos = new ArrayList<>();
            for (AsignaturaSeccion asig : asignaciones) {
                acumulativos.addAll(acumulativoRepository.findByAsignaturaIdAndSeccionId(
                        asig.getAsignatura().getId(), asig.getSeccion().getId()));
            }

            // Fetch notas for those acumulativos
            List<NotaAcumulativo> notasAcumulativos = new ArrayList<>();
            for (Acumulativo ac : acumulativos) {
                notasAcumulativos.addAll(notaAcumulativoRepository.findByAcumulativo(ac));
            }

            // Fetch periodos associated with the teacher's sections
            List<Periodo> periodos = secciones.stream()
                    .map(Seccion::getPeriodo)
                    .filter(p -> p != null)
                    .distinct()
                    .collect(Collectors.toList());

            DocenteSyncDTO response = new DocenteSyncDTO(
                    docente, centros, secciones, asignaturas, asignaciones,
                    alumnos, matriculas, tipoAcumulativos, acumulativos, notasAcumulativos,
                    periodos
            );
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
