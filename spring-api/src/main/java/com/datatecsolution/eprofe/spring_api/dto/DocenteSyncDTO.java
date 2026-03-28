package com.datatecsolution.eprofe.spring_api.dto;

import com.datatecsolution.eprofe.spring_api.model.Docente;
import com.datatecsolution.eprofe.spring_api.model.Centro;
import com.datatecsolution.eprofe.spring_api.model.Seccion;
import com.datatecsolution.eprofe.spring_api.model.Asignatura;
import com.datatecsolution.eprofe.spring_api.model.AsignaturaSeccion;
import com.datatecsolution.eprofe.spring_api.model.Alumno;
import com.datatecsolution.eprofe.spring_api.model.Matricula;
import com.datatecsolution.eprofe.spring_api.model.Acumulativo;
import com.datatecsolution.eprofe.spring_api.model.NotaAcumulativo;
import com.datatecsolution.eprofe.spring_api.model.TipoAcumulativo;
import com.datatecsolution.eprofe.spring_api.model.Periodo;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocenteSyncDTO {
    private Docente docente;
    private List<Centro> centros;
    private List<Seccion> secciones;
    private List<Asignatura> asignaturas;
    private List<AsignaturaSeccion> asignaturas_secciones;
    private List<Alumno> alumnos;
    private List<Matricula> matriculas;
    private List<TipoAcumulativo> tipo_acumulativos;
    private List<Acumulativo> acumulativos;
    private List<NotaAcumulativo> notas_acumulativos;
    private List<Periodo> periodos;
}
