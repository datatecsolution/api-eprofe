import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class Docente extends Model {
    static table = 'docentes'

    @field('user_sace') userSace: string
    @field('nombre') nombre: string
    @field('apellido') apellido: string
    @field('direccion') direccion: string
    @field('email') email: string
    @field('telefono') telefono: number
    @field('password_sace') passwordSace: string

    @readonly @date('created_at') createdAt: number
    @readonly @date('updated_at') updatedAt: number
}
