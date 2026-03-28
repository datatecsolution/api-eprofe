package com.datatecsolution.eprofe.spring_api.repository;

import com.datatecsolution.eprofe.spring_api.model.AsignaturaSeccion;
import com.datatecsolution.eprofe.spring_api.model.Docente;
import com.datatecsolution.eprofe.spring_api.model.Seccion;
import com.datatecsolution.eprofe.spring_api.model.Asignatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AsignaturaSeccionRepository extends JpaRepository<AsignaturaSeccion, Long> {
    List<AsignaturaSeccion> findByDocente(Docente docente);

    @Query("SELECT DISTINCT asigSec.seccion FROM AsignaturaSeccion asigSec WHERE asigSec.docente.id = :docenteId")
    List<Seccion> findSeccionesByDocenteId(Long docenteId);

    Optional<AsignaturaSeccion> findByDocenteAndSeccionAndAsignatura(Docente docente, Seccion seccion,
            Asignatura asignatura);
}
