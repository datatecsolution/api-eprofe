package com.datatecsolution.eprofe.spring_api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class AsistenciaRequest {

    @NotNull(message = "seccion_id es requerido")
    private Long seccionId;

    @NotNull(message = "asignatura_id es requerido")
    private Long asignaturaId;

    @NotBlank(message = "fecha es requerida")
    private String fecha;

    @NotNull(message = "detalles_asistencia es requerido")
    private List<DetalleItem> detallesAsistencia;

    @Data
    public static class DetalleItem {
        private Long id;
        @NotNull(message = "alumno_id es requerido")
        private Long alumnoId;
        private Boolean estado;
        private Boolean excusa;
    }
}
