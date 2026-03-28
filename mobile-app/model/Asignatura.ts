import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class Asignatura extends Model {
    static table = 'asignaturas'

    @field('nombre') nombre: string
    @field('alias') alias: string
    @field('tipo') tipo: string

    @readonly @date('created_at') createdAt: number
    @readonly @date('updated_at') updatedAt: number
}
