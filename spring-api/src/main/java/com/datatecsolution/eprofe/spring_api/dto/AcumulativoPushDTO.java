package com.datatecsolution.eprofe.spring_api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AcumulativoPushDTO {
    private String idMovil;
    private String descripcion;
    private Double valor;
    private LocalDate fecha;
    private Long asignaturaId;
    private Long seccionId;
    private Integer parcial;
    private Long tipoAcumulativoId;
}
