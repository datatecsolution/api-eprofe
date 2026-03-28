import { Database } from '@nozbe/watermelondb'
import { adapter } from './adapter'

import Docente from './Docente'
import Centro from './Centro'
import Seccion from './Seccion'
import Asignatura from './Asignatura'
import Asistencia from './Asistencia'
import Acumulativo from './Acumulativo'
import NotaAcumulativo from './NotaAcumulativo'
import AsignaturaSeccion from './AsignaturaSeccion'
import Matricula from './Matricula'
import Alumno from './Alumno'
import TipoAcumulativo from './TipoAcumulativo'
import Periodo from './Periodo'

// Then, make a Watermelon database from it!
export const database = new Database({
    adapter,
    modelClasses: [
        Docente,
        Centro,
        Seccion,
        Asignatura,
        Matricula,
        Alumno,
        Asistencia,
        Acumulativo,
        NotaAcumulativo,
        AsignaturaSeccion,
        TipoAcumulativo,
        Periodo,
    ],
})
