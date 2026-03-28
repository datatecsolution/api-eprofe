package com.datatecsolution.eprofe.spring_api.repository;

import com.datatecsolution.eprofe.spring_api.model.Modalidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ModalidadRepository extends JpaRepository<Modalidad, Long> {
    Optional<Modalidad> findByNombreContaining(String nombre);
}
