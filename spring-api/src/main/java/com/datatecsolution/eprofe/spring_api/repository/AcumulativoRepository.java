package com.datatecsolution.eprofe.spring_api.repository;

import com.datatecsolution.eprofe.spring_api.model.Acumulativo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcumulativoRepository extends JpaRepository<Acumulativo, Long> {

    @Query("SELECT a FROM Acumulativo a WHERE a.asignatura.id = :asignaturaId AND a.seccion.id = :seccionId")
    List<Acumulativo> findByAsignaturaIdAndSeccionId(@Param("asignaturaId") Long asignaturaId, @Param("seccionId") Long seccionId);

    Optional<Acumulativo> findByMovilId(Integer movilId);

    @Query("SELECT DISTINCT a FROM Acumulativo a " +
           "JOIN AsignaturaSeccion ase ON ase.asignatura.id = a.asignatura.id AND ase.seccion.id = a.seccion.id " +
           "WHERE ase.docente.id = :docenteId " +
           "ORDER BY a.id DESC")
    List<Acumulativo> findByDocenteId(@Param("docenteId") Long docenteId);

    @Query("SELECT DISTINCT a FROM Acumulativo a " +
           "JOIN AsignaturaSeccion ase ON ase.asignatura.id = a.asignatura.id AND ase.seccion.id = a.seccion.id " +
           "WHERE ase.docente.id = :docenteId AND ase.seccion.id = :seccionId " +
           "ORDER BY a.id DESC")
    List<Acumulativo> findByDocenteIdAndSeccionId(@Param("docenteId") Long docenteId, @Param("seccionId") Long seccionId);

    @Query("SELECT DISTINCT a FROM Acumulativo a " +
           "JOIN AsignaturaSeccion ase ON ase.asignatura.id = a.asignatura.id AND ase.seccion.id = a.seccion.id " +
           "WHERE ase.docente.id = :docenteId AND a.seccion.id = :seccionId " +
           "AND a.parcial = :parcial AND a.asignatura.id = :asignaturaId " +
           "ORDER BY a.id DESC")
    List<Acumulativo> findByDocenteSeccionParcialAsignatura(
            @Param("docenteId") Long docenteId,
            @Param("seccionId") Long seccionId,
            @Param("parcial") Integer parcial,
            @Param("asignaturaId") Long asignaturaId);
}
