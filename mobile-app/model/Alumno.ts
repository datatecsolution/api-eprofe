import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class Alumno extends Model {
    static table = 'alumnos'

    @field('rne') rne: string
    @field('nombre') nombre: string
    @field('apellido') apellido: string
    @field('genero') genero: number
    @field('fecha_nacimiento') fechaNacimiento: number
    @field('telefono') telefono: number

    @readonly @date('created_at') createdAt: number
    @readonly @date('updated_at') updatedAt: number
}
