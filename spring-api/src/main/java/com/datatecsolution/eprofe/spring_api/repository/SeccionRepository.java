package com.datatecsolution.eprofe.spring_api.repository;

import com.datatecsolution.eprofe.spring_api.model.Seccion;
import com.datatecsolution.eprofe.spring_api.model.Centro;
import com.datatecsolution.eprofe.spring_api.model.Periodo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SeccionRepository extends JpaRepository<Seccion, Long> {
    Optional<Seccion> findByCursoAndSeccionAndJornadaAndCentro(String curso, String seccion, String jornada,
            Centro centro);

    Optional<Seccion> findByCursoAndSeccionAndJornadaAndCentroAndPeriodo(String curso, String seccion, String jornada,
            Centro centro, Periodo periodo);
}
