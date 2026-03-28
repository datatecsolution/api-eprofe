import { Model } from '@nozbe/watermelondb'
import { field, date, relation, readonly } from '@nozbe/watermelondb/decorators'
import Alumno from './Alumno'
import Acumulativo from './Acumulativo'

export default class NotaAcumulativo extends Model {
    static table = 'notas_acumulativos'

    @field('nota') nota: number
    @field('uploaded') uploaded: boolean

    @readonly @date('created_at') createdAt: number
    @readonly @date('updated_at') updatedAt: number

    @relation('alumnos', 'alumno_id') alumno: Alumno
    @relation('acumulativos', 'acumulativo_id') acumulativo: Acumulativo
}
