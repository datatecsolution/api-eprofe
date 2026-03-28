package com.datatecsolution.eprofe.spring_api.repository;

import com.datatecsolution.eprofe.spring_api.model.DetalleAsistencia;
import com.datatecsolution.eprofe.spring_api.model.EncabezadoAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DetalleAsistenciaRepository extends JpaRepository<DetalleAsistencia, Long> {
    Optional<DetalleAsistencia> findByEncabezadoAsistenciaAndAlumnoId(EncabezadoAsistencia encabezadoAsistencia,
            Long alumnoId);
}
