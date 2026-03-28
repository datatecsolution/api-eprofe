import { schemaMigrations, createTable, addColumns } from '@nozbe/watermelondb/Schema/migrations'

export const migrations = schemaMigrations({
    migrations: [
        {
            toVersion: 2,
            steps: [
                addColumns({
                    table: 'acumulativos',
                    columns: [
                        { name: 'parcial', type: 'number' },
                        { name: 'tipo_acumulativo_id', type: 'string', isOptional: true },
                    ],
                }),
                createTable({
                    name: 'tipo_acumulativos',
                    columns: [
                        { name: 'descripcion', type: 'string' },
                        { name: 'created_at', type: 'number' },
                        { name: 'updated_at', type: 'number' },
                    ],
                }),
            ],
        },
        {
            toVersion: 3,
            steps: [
                createTable({
                    name: 'periodos',
                    columns: [
                        { name: 'fecha_inicio', type: 'string' },
                        { name: 'fecha_final', type: 'string' },
                        { name: 'estado', type: 'boolean' },
                        { name: 'observaciones', type: 'string', isOptional: true },
                        { name: 'created_at', type: 'number' },
                        { name: 'updated_at', type: 'number' },
                    ],
                }),
            ],
        },
    ],
})
