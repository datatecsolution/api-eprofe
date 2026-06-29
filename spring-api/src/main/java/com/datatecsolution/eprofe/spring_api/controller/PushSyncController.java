package com.datatecsolution.eprofe.spring_api.controller;

import com.datatecsolution.eprofe.spring_api.dto.*;
import com.datatecsolution.eprofe.spring_api.model.*;
import com.datatecsolution.eprofe.spring_api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sync")
@CrossOrigin(origins = "*")
@Tag(name = "Push Sync", description = "Push de datos offline desde la app movil")
public class PushSyncController {

    @Autowired
    private EncabezadoAsistenciaRepository encabezadoRepository;
    @Autowired
    private DetalleAsistenciaRepository detalleRepository;
    @Autowired
    private SeccionRepository seccionRepository;
    @Autowired
    private AsignaturaRepository asignaturaRepository;
    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private AcumulativoRepository acumulativoRepository;
    @Autowired
    private NotaAcumulativoRepository notaRepository;
    @Autowired
    private TipoAcumulativoRepository tipoAcumulativoRepository;

    @Operation(summary = "Enviar datos offline (asistencias, acumulativos, notas) al servidor")
    @PostMapping("/push")
    @Transactional
    public ResponseEntity<?> pushChanges(@RequestBody PushDataDTO pushData) {
        try {
            // 1. Process Asistencias
            if (pushData.getAsistencias() != null && !pushData.getAsistencias().isEmpty()) {
                processAsistencias(pushData.getAsistencias());
            }

            // 2. Process Acumulativos and map IDs
            Map<String, Long> acumulativoIdMap = new HashMap<>(); // LocalID -> RemoteID
            if (pushData.getAcumulativos() != null && !pushData.getAcumulativos().isEmpty()) {
                processAcumulativos(pushData.getAcumulativos(), acumulativoIdMap);
            }

            // 3. Process Notas
            if (pushData.getNotas() != null && !pushData.getNotas().isEmpty()) {
                processNotas(pushData.getNotas(), acumulativoIdMap);
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Data synced successfully"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Error syncing data: " + e.getMessage()));
        }
    }

    private void processAsistencias(List<AsistenciaPushDTO> asistencias) {
        // Group by Seccion, Asignatura, Date to find or create Encabezado
        // Key: seccionId_asignaturaId_fecha
        Map<String, List<AsistenciaPushDTO>> grouped = asistencias.stream()
                .collect(Collectors.groupingBy(a -> a.getSeccionId() + "_" + a.getAsignaturaId() + "_" + a.getFecha()));

        grouped.forEach((key, list) -> {
            AsistenciaPushDTO first = list.get(0);

            // Find existing Encabezado or create new
            // Assuming we don't have a direct findBy method implemented yet, let's just
            // create one for simplicity or improve repo
            // Ideally: findBySeccionAndAsignaturaAndFecha
            // For MVP: We check manually or assume creation if handled correctly by logic.
            // Better approach: Create Encabezado if not exists.

            Optional<EncabezadoAsistencia> existingEncabezado = encabezadoRepository
                    .findBySeccionIdAndAsignaturaIdAndFecha(
                            first.getSeccionId(), first.getAsignaturaId(), first.getFecha());

            EncabezadoAsistencia encabezado;
            if (existingEncabezado.isPresent()) {
                encabezado = existingEncabezado.get();
            } else {
                encabezado = new EncabezadoAsistencia();
                encabezado.setSeccion(seccionRepository.findById(first.getSeccionId()).orElse(null));
                encabezado.setAsignatura(asignaturaRepository.findById(first.getAsignaturaId()).orElse(null));
                encabezado.setFecha(first.getFecha());
                encabezado = encabezadoRepository.save(encabezado);
            }

            for (AsistenciaPushDTO a : list) {
                // Check if Detalle exists for this student in this encabezado
                Optional<DetalleAsistencia> existingDetalle = detalleRepository
                        .findByEncabezadoAsistenciaAndAlumnoId(encabezado, a.getAlumnoId());

                DetalleAsistencia detalle;
                if (existingDetalle.isPresent()) {
                    detalle = existingDetalle.get();
                } else {
                    detalle = new DetalleAsistencia();
                    detalle.setEncabezadoAsistencia(encabezado);
                    detalle.setAlumno(alumnoRepository.findById(a.getAlumnoId()).orElse(null));
                }

                // Map 'P', 'A', 'E' to Booleans
                // P: estado=true, excusa=false
                // A: estado=false, excusa=false
                // E: estado=false, excusa=true
                if ("P".equals(a.getEstado())) {
                    detalle.setEstado(true);
                    detalle.setExcusa(false);
                } else if ("E".equals(a.getEstado())) {
                    detalle.setEstado(false);
                    detalle.setExcusa(true);
                } else {
                    detalle.setEstado(false); // Ausente
                    detalle.setExcusa(false); // Sin excusa
                }

                detalleRepository.save(detalle);
            }
        });
    }

    private void processAcumulativos(List<AcumulativoPushDTO> lista, Map<String, Long> idMap) {
        for (AcumulativoPushDTO dto : lista) {
            try {
                // Parse movilId from string to Integer for duplicate detection
                Integer movilIdInt = null;
                if (dto.getIdMovil() != null && !dto.getIdMovil().isEmpty()) {
                    try { movilIdInt = Integer.parseInt(dto.getIdMovil()); } catch (NumberFormatException ignored) {}
                }

                // Check if already exists by movilId to prevent duplicates
                Acumulativo acumulativo = null;
                if (movilIdInt != null) {
                    acumulativo = acumulativoRepository.findByMovilId(movilIdInt).orElse(null);
                }
                if (acumulativo == null) {
                    acumulativo = new Acumulativo();
                }

                acumulativo.setDescripcion(dto.getDescripcion());
                acumulativo.setValor(dto.getValor());
                acumulativo.setFecha(dto.getFecha());
                acumulativo.setParcial(dto.getParcial());
                acumulativo.setAsignatura(asignaturaRepository.findById(dto.getAsignaturaId()).orElse(null));
                acumulativo.setSeccion(seccionRepository.findById(dto.getSeccionId()).orElse(null));
                if (movilIdInt != null) {
                    acumulativo.setMovilId(movilIdInt);
                }
                if (dto.getTipoAcumulativoId() != null) {
                    acumulativo.setTipoAcumulativo(tipoAcumulativoRepository.findById(dto.getTipoAcumulativoId()).orElse(null));
                }

                Acumulativo saved = acumulativoRepository.save(acumulativo);
                idMap.put(dto.getIdMovil(), saved.getId());
            } catch (Exception e) {
                System.err.println("Error saving acumulativo: " + e.getMessage());
            }
        }
    }

    private void processNotas(List<NotaPushDTO> lista, Map<String, Long> idMap) {
        for (NotaPushDTO dto : lista) {
            Long remoteAcumuladoId = null;

            // Try to resolve Acumulativo ID
            if (dto.getAcumulativoIdRemote() != null && dto.getAcumulativoIdRemote() > 0) {
                remoteAcumuladoId = dto.getAcumulativoIdRemote();
            } else if (dto.getAcumulativoIdMovil() != null && idMap.containsKey(dto.getAcumulativoIdMovil())) {
                remoteAcumuladoId = idMap.get(dto.getAcumulativoIdMovil());
            }

            if (remoteAcumuladoId == null) {
                System.err.println("Cannot find remote ID for Acumulativo: " + dto.getAcumulativoIdMovil());
                continue;
            }

            Optional<Acumulativo> acOpt = acumulativoRepository.findById(remoteAcumuladoId);
            Optional<Alumno> alOpt = alumnoRepository.findById(dto.getAlumnoId());

            if (acOpt.isPresent() && alOpt.isPresent()) {
                // Check existing note
                Optional<NotaAcumulativo> existing = notaRepository.findByAlumnoAndAcumulativo(alOpt.get(),
                        acOpt.get());
                NotaAcumulativo nota;
                if (existing.isPresent()) {
                    nota = existing.get();
                } else {
                    nota = new NotaAcumulativo();
                    nota.setAlumno(alOpt.get());
                    nota.setAcumulativo(acOpt.get());
                }
                nota.setNota(dto.getNota());
                notaRepository.save(nota);
            }
        }
    }
}
