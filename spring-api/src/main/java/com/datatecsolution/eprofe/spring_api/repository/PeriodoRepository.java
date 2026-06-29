package com.datatecsolution.eprofe.spring_api.repository;

import com.datatecsolution.eprofe.spring_api.model.Periodo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PeriodoRepository extends JpaRepository<Periodo, Long> {
    List<Periodo> findByEstadoTrue();

    List<Periodo> findByEstadoTrueOrderByIdDesc();
}
