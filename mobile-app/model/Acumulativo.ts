import { Model } from '@nozbe/watermelondb'
import { field, date, relation, readonly } from '@nozbe/watermelondb/decorators'
import Seccion from './Seccion'
import Asignatura from './Asignatura'

export default class Acumulativo extends Model {
    static table = 'acumulativos'

    @field('descripcion') descripcion: string
    @field('valor') valor: number
    @field('parcial') parcial: number
    @field('fecha') fecha: string
    @field('uploaded') uploaded: boolean

    @readonly @date('created_at') createdAt: number
    @readonly @date('updated_at') updatedAt: number

    @relation('secciones', 'seccion_id') seccion: Seccion
    @relation('asignaturas', 'asignatura_id') asignatura: Asignatura
    @relation('tipo_acumulativos', 'tipo_acumulativo_id') tipoAcumulativo: any
}
