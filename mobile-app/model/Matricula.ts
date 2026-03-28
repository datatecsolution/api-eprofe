import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'
import Seccion from './Seccion'
import Alumno from './Alumno'

export default class Matricula extends Model {
    static table = 'matriculas'

    @field('year') year: number

    @field('seccion_id') seccionId: string
    @relation('secciones', 'seccion_id') seccion: Seccion

    @field('alumno_id') alumnoId: string
    @relation('alumnos', 'alumno_id') alumno: Alumno // Need to create Alumno model first

    @readonly @date('created_at') createdAt: number
    @readonly @date('updated_at') updatedAt: number
}
