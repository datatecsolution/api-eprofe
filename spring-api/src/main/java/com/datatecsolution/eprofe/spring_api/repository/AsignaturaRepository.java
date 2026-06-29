package com.datatecsolution.eprofe.spring_api.repository;

import com.datatecsolution.eprofe.spring_api.model.Asignatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AsignaturaRepository extends JpaRepository<Asignatura, Long> {
    Optional<Asignatura> findByNombre(String nombre);

    @Query("SELECT a FROM Asignatura a JOIN AsignaturaSeccion ase ON ase.asignatura.id = a.id " +
           "WHERE ase.seccion.id = :seccionId ORDER BY a.nombre")
    List<Asignatura> findBySeccionId(@Param("seccionId") Long seccionId);

    @Query("SELECT DISTINCT a FROM Asignatura a " +
           "JOIN AsignaturaSeccion ase ON ase.asignatura.id = a.id " +
           "JOIN Seccion s ON s.id = ase.seccion.id " +
           "JOIN Periodo p ON p.id = s.periodo.id " +
           "WHERE ase.docente.id = :docenteId AND ase.seccion.id = :seccionId AND p.estado = true")
    List<Asignatura> findByDocenteIdAndSeccionId(@Param("docenteId") Long docenteId, @Param("seccionId") Long seccionId);
}
