package com.datatecsolution.eprofe.spring_api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotaPushDTO {
    private String idMovil;
    private Long alumnoId;
    private String acumulativoIdMovil; // Reference to the local Acumulativo ID
    private Long acumulativoIdRemote; // Reference if it was already synced (optional)
    private Double nota;
}
