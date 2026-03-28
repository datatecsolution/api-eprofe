import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export default class Periodo extends Model {
    static table = 'periodos'

    @field('fecha_inicio') fechaInicio: string
    @field('fecha_final') fechaFinal: string
    @field('estado') estado: boolean
    @field('observaciones') observaciones: string

    @readonly @date('created_at') createdAt: number
    @readonly @date('updated_at') updatedAt: number
}
