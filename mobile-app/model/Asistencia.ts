import { Model } from '@nozbe/watermelondb'
import { field, date, text, relation, readonly } from '@nozbe/watermelondb/decorators'
import Alumno from './Alumno'
import Seccion from './Seccion'
import Asignatura from './Asignatura'

export default class Asistencia extends Model {
    static table = 'asistencias'

    @text('fecha') fecha: string
    @text('estado') estado: string // 'P' | 'A' | 'E'
    @text('observacion') observacion: string
    @field('uploaded') uploaded: boolean

    @readonly @date('created_at') createdAt: number
    @readonly @date('updated_at') updatedAt: number

    @relation('alumnos', 'alumno_id') alumno: Alumno
    @relation('secciones', 'seccion_id') seccion: Seccion
    @relation('asignaturas', 'asignatura_id') asignatura: Asignatura
}
