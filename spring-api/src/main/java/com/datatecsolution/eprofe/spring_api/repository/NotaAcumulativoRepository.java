package com.datatecsolution.eprofe.spring_api.repository;

import com.datatecsolution.eprofe.spring_api.model.NotaAcumulativo;
import com.datatecsolution.eprofe.spring_api.model.Acumulativo;
import com.datatecsolution.eprofe.spring_api.model.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotaAcumulativoRepository extends JpaRepository<NotaAcumulativo, Long> {
    List<NotaAcumulativo> findByAcumulativo(Acumulativo acumulativo);

    List<NotaAcumulativo> findByAlumno(Alumno alumno);

    Optional<NotaAcumulativo> findByAlumnoAndAcumulativo(Alumno alumno, Acumulativo acumulativo);

    @Query("SELECT n FROM NotaAcumulativo n JOIN n.acumulativo a " +
           "WHERE n.alumno.id = :alumnoId AND a.asignatura.id = :asignaturaId " +
           "AND a.parcial = :parcial AND a.seccion.id = :seccionId")
    List<NotaAcumulativo> findByAlumnoAsignaturaParcialSeccion(
            @Param("alumnoId") Long alumnoId,
            @Param("asignaturaId") Long asignaturaId,
            @Param("parcial") Integer parcial,
            @Param("seccionId") Long seccionId);
}
