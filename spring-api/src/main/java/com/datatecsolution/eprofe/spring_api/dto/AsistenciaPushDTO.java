package com.datatecsolution.eprofe.spring_api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AsistenciaPushDTO {
    private String idMovil; // Local ID if needed
    private Long alumnoId;
    private Long asignaturaId;
    private Long seccionId;
    private LocalDate fecha;
    private String estado; // 'P', 'A', 'E'
}
