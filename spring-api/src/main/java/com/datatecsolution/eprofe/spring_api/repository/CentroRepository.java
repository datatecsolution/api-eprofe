package com.datatecsolution.eprofe.spring_api.repository;

import com.datatecsolution.eprofe.spring_api.model.Centro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CentroRepository extends JpaRepository<Centro, Long> {
    Optional<Centro> findByCodigoSace(String codigoSace);
}
