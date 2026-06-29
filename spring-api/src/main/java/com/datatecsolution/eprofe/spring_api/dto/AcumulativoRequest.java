package com.datatecsolution.eprofe.spring_api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class AcumulativoRequest {

    @NotNull(message = "seccion_id es requerido")
    private Long seccionId;

    @NotBlank(message = "descripcion es requerida")
    private String descripcion;

    @NotNull(message = "tipo_acumulativo_id es requerido")
    private Long tipoAcumulativoId;

    @NotBlank(message = "fecha es requerida")
    private String fecha;

    @NotNull(message = "parcial es requerido")
    private Integer parcial;

    @NotNull(message = "valor es requerido")
    private Double valor;

    @NotNull(message = "asignatura_id es requerido")
    private Long asignaturaId;

    private List<NotaItem> notasAcumulativos;

    @Data
    public static class NotaItem {
        @NotNull(message = "alumno_id es requerido")
        private Long alumnoId;
        private Double nota;
    }
}
