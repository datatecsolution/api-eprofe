package com.datatecsolution.eprofe.spring_api.repository;

import com.datatecsolution.eprofe.spring_api.model.EncabezadoAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface EncabezadoAsistenciaRepository extends JpaRepository<EncabezadoAsistencia, Long> {
    Optional<EncabezadoAsistencia> findBySeccionIdAndAsignaturaIdAndFecha(Long seccionId, Long asignaturaId,
            LocalDate fecha);
}
