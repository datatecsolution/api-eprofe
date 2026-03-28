package com.datatecsolution.eprofe.spring_api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PushDataDTO {
    private List<AsistenciaPushDTO> asistencias;
    private List<AcumulativoPushDTO> acumulativos;
    private List<NotaPushDTO> notas;
}
