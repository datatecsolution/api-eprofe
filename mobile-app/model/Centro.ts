import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class Centro extends Model {
    static table = 'centros'

    @field('nombre') nombre: string
    @field('modalidad') modalidad: string

    @readonly @date('created_at') createdAt: number
    @readonly @date('updated_at') updatedAt: number
}
