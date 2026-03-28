package com.datatecsolution.eprofe.spring_api.repository;

import com.datatecsolution.eprofe.spring_api.model.NotaAcumulativo;
import com.datatecsolution.eprofe.spring_api.model.Acumulativo;
import com.datatecsolution.eprofe.spring_api.model.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotaAcumulativoRepository extends JpaRepository<NotaAcumulativo, Long> {
    List<NotaAcumulativo> findByAcumulativo(Acumulativo acumulativo);

    List<NotaAcumulativo> findByAlumno(Alumno alumno);

    Optional<NotaAcumulativo> findByAlumnoAndAcumulativo(Alumno alumno, Acumulativo acumulativo);
}
