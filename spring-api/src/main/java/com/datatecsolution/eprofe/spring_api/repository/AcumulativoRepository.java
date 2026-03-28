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
}
