import { Model } from '@nozbe/watermelondb'
import { field, date, relation, readonly } from '@nozbe/watermelondb/decorators'
import Docente from './Docente'
import Seccion from './Seccion'
import Asignatura from './Asignatura'

export default class AsignaturaSeccion extends Model {
    static table = 'asignaturas_secciones'

    @readonly @date('created_at') createdAt: number
    @readonly @date('updated_at') updatedAt: number

    @relation('docentes', 'docente_id') docente: Docente
    @relation('secciones', 'seccion_id') seccion: Seccion
    @relation('asignaturas', 'asignatura_id') asignatura: Asignatura
}
