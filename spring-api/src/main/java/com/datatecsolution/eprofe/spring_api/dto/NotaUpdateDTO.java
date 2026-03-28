package com.datatecsolution.eprofe.spring_api.dto;

import lombok.Data;

@Data
public class NotaUpdateDTO {
    private Long alumnoId;
    private Long acumulativoId;
    private Double nota;
    private Integer movilId;
}
