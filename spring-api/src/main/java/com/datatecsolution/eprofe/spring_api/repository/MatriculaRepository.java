package com.datatecsolution.eprofe.spring_api.repository;

import com.datatecsolution.eprofe.spring_api.model.Matricula;
import com.datatecsolution.eprofe.spring_api.model.Alumno;
import com.datatecsolution.eprofe.spring_api.model.Seccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {
    List<Matricula> findBySeccionIdAndYear(Long seccionId, Integer year);

    boolean existsByAlumnoAndSeccion(Alumno alumno, Seccion seccion);
}
