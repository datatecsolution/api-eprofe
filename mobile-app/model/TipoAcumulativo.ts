import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class TipoAcumulativo extends Model {
    static table = 'tipo_acumulativos'

    @field('descripcion') descripcion: string

    @readonly @date('created_at') createdAt: number
    @readonly @date('updated_at') updatedAt: number
}
