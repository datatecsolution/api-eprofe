package com.datatecsolution.eprofe.spring_api.repository;

import com.datatecsolution.eprofe.spring_api.model.EncabezadoAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EncabezadoAsistenciaRepository extends JpaRepository<EncabezadoAsistencia, Long> {
    Optional<EncabezadoAsistencia> findBySeccionIdAndAsignaturaIdAndFecha(Long seccionId, Long asignaturaId,
            LocalDate fecha);

    @Query("SELECT DISTINCT e FROM EncabezadoAsistencia e " +
           "JOIN AsignaturaSeccion ase ON ase.asignatura.id = e.asignatura.id AND ase.seccion.id = e.seccion.id " +
           "WHERE ase.docente.id = :docenteId AND e.seccion.id = :seccionId " +
           "ORDER BY e.fecha DESC")
    List<EncabezadoAsistencia> findByDocenteIdAndSeccionId(
            @Param("docenteId") Long docenteId,
            @Param("seccionId") Long seccionId);
}
