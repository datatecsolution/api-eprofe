import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'
import Centro from './Centro'
import Periodo from './Periodo'

export default class Seccion extends Model {
    static table = 'secciones'

    @field('curso') curso: string
    @field('seccion') seccion: string
    @field('jornada') jornada: string

    @field('centro_id') centroId: string
    @relation('centros', 'centro_id') centro: Centro

    @field('modalidad_id') modalidadId: string
    @field('periodo_id') periodoId: string
    @relation('periodos', 'periodo_id') periodo: Periodo

    @readonly @date('created_at') createdAt: number
    @readonly @date('updated_at') updatedAt: number
}
