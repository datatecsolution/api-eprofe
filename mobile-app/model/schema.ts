import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const mySchema = appSchema({
    version: 3,
    tables: [
        tableSchema({
            name: 'docentes',
            columns: [
                { name: 'user_sace', type: 'string' },
                { name: 'nombre', type: 'string' },
                { name: 'apellido', type: 'string' },
                { name: 'direccion', type: 'string', isOptional: true },
                { name: 'email', type: 'string', isOptional: true },
                { name: 'telefono', type: 'number', isOptional: true },
                { name: 'password_sace', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'centros',
            columns: [
                { name: 'nombre', type: 'string' },
                { name: 'modalidad', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'secciones',
            columns: [
                { name: 'curso', type: 'string' },
                { name: 'seccion', type: 'string' },
                { name: 'jornada', type: 'string' },
                { name: 'modalidad_id', type: 'string' }, // Relationship
                { name: 'centro_id', type: 'string' }, // Relationship
                { name: 'periodo_id', type: 'string' }, // Relationship
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'matriculas',
            columns: [
                { name: 'alumno_id', type: 'string' }, // Relationship
                { name: 'seccion_id', type: 'string' }, // Relationship
                { name: 'year', type: 'number' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'alumnos',
            columns: [
                { name: 'rne', type: 'string', isOptional: true },
                { name: 'nombre', type: 'string' },
                { name: 'apellido', type: 'string' },
                { name: 'genero', type: 'number', isOptional: true },
                { name: 'fecha_nacimiento', type: 'number', isOptional: true },
                { name: 'telefono', type: 'number', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'asignaturas',
            columns: [
                { name: 'nombre', type: 'string' },
                { name: 'alias', type: 'string', isOptional: true },
                { name: 'tipo', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({ // Many-to-Many equivalent or ternary
            name: 'asignaturas_secciones', // Assignments
            columns: [
                { name: 'docente_id', type: 'string' },
                { name: 'seccion_id', type: 'string' },
                { name: 'asignatura_id', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'asistencias',
            columns: [
                { name: 'alumno_id', type: 'string' },
                { name: 'asignatura_id', type: 'string' },
                { name: 'seccion_id', type: 'string' },
                { name: 'fecha', type: 'string' },
                { name: 'estado', type: 'string' },
                { name: 'observacion', type: 'string', isOptional: true },
                { name: 'uploaded', type: 'boolean' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'acumulativos',
            columns: [
                { name: 'seccion_id', type: 'string' },
                { name: 'asignatura_id', type: 'string' },
                { name: 'parcial', type: 'number' },
                { name: 'tipo_acumulativo_id', type: 'string', isOptional: true },
                { name: 'descripcion', type: 'string' }, // "Examen 1"
                { name: 'fecha', type: 'string' },
                { name: 'valor', type: 'number' }, // Max score
                { name: 'uploaded', type: 'boolean' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'notas_acumulativos',
            columns: [
                { name: 'alumno_id', type: 'string' },
                { name: 'acumulativo_id', type: 'string' },
                { name: 'nota', type: 'number' },
                { name: 'uploaded', type: 'boolean' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'tipo_acumulativos',
            columns: [
                { name: 'descripcion', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'periodos',
            columns: [
                { name: 'fecha_inicio', type: 'string' },
                { name: 'fecha_final', type: 'string' },
                { name: 'estado', type: 'boolean' },
                { name: 'observaciones', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
    ],
})
