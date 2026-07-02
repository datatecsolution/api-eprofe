import { Platform } from 'react-native';
import { Q } from '@nozbe/watermelondb';
import { database } from '../model/index';
import api from '../services/api';

export function useInitialSync() {
    const pullData = async (docenteId: number, userCookies?: string) => {
        try {
            let data: any;

            if (userCookies) {
                // Full SACE sync: send cookies from WebView to process Excel files
                const response = await api.post(`/usersace/sicronizar`, {
                    id: docenteId,
                    cookies: userCookies
                });
                data = response.data;
            } else {
                // En WEB el navegador no puede hacer el scraping de SACE (CORS/cookies), así que
                // se lo pedimos al backend: descarga de SACE server-side y puebla su BD. Luego
                // bajamos el dataset ya estructurado. Si el scrape falla, seguimos con lo que el
                // servidor ya tenga (no bloquea el acceso a datos previos).
                if (Platform.OS === 'web') {
                    try {
                        await api.post(`/sace/sync-server/${docenteId}`);
                    } catch (e) {
                        console.warn('Server-side SACE sync failed; continuing with existing server data', e);
                    }
                }
                // Direct sync: pull already-processed data from backend
                const response = await api.get(`/sync/initial/${docenteId}`);
                data = response.data;
            }

            if (!data || !data.secciones) {
                console.error("No valid sync object payload received.");
                return false;
            }

            await database.write(async () => {
                const batchOperations: any[] = [];

                // Get DB Collections
                const seccionCollection = database.get('secciones');
                const asignaturaCollection = database.get('asignaturas');
                const asigSecCollection = database.get('asignaturas_secciones');
                const alumnoCollection = database.get('alumnos');
                const matriculaCollection = database.get('matriculas');
                const tipoAcumulativoCollection = database.get('tipo_acumulativos');
                const acumulativoCollection = database.get('acumulativos');
                const notaAcumulativoCollection = database.get('notas_acumulativos');
                const periodoCollection = database.get('periodos');

                // 1. Reset reference data (always safe to replace)
                const oldSecciones = await seccionCollection.query().fetch();
                const oldAsignaturas = await asignaturaCollection.query().fetch();
                const oldAsigSec = await asigSecCollection.query().fetch();
                const oldAlumnos = await alumnoCollection.query().fetch();
                const oldMatriculas = await matriculaCollection.query().fetch();
                const oldTipoAcumulativos = await tipoAcumulativoCollection.query().fetch();
                const oldPeriodos = await periodoCollection.query().fetch();

                [...oldSecciones, ...oldAsignaturas, ...oldAsigSec, ...oldAlumnos, ...oldMatriculas, ...oldTipoAcumulativos, ...oldPeriodos].forEach(r => {
                    batchOperations.push(r.prepareDestroyPermanently());
                });

                // 2. Reset acumulativos/notas that have been uploaded (safe to replace with server data)
                // Keep local-only records (uploaded=false) to avoid losing unsynced work
                const uploadedAcumulativos = await acumulativoCollection.query(Q.where('uploaded', true)).fetch();
                const uploadedNotas = await notaAcumulativoCollection.query(Q.where('uploaded', true)).fetch();
                [...uploadedAcumulativos, ...uploadedNotas].forEach(r => {
                    batchOperations.push(r.prepareDestroyPermanently());
                });

                // 3. Insert new JSON sync data
                // Insert periodos
                (data.periodos || []).forEach((item: any) => {
                    batchOperations.push(periodoCollection.prepareCreate((record: any) => {
                        record._raw.id = item.id.toString();
                        record._raw.fecha_inicio = item.fechaInicio || '';
                        record._raw.fecha_final = item.fechaFinal || '';
                        record._raw.estado = item.estado ?? true;
                        record._raw.observaciones = item.observaciones || '';
                    }));
                });

                (data.secciones || []).forEach((item: any) => {
                    batchOperations.push(seccionCollection.prepareCreate((record: any) => {
                        record._raw.id = item.id.toString();
                        record._raw.centro_id = item.centro?.id?.toString() || '';
                        record._raw.periodo_id = item.periodo?.id?.toString() || '';
                        record._raw.curso = item.curso;
                        record._raw.seccion = item.seccion;
                        record._raw.jornada = item.jornada;
                    }));
                });

                (data.asignaturas || []).forEach((item: any) => {
                    batchOperations.push(asignaturaCollection.prepareCreate((record: any) => {
                        record._raw.id = item.id.toString();
                        record._raw.nombre = item.nombre;
                        record._raw.alias = item.alias || '';
                        record._raw.tipo = item.tipo || '';
                    }));
                });

                (data.asignaturas_secciones || []).forEach((item: any) => {
                    const asigSeccionId = item.seccion?.id?.toString();
                    const asigAsignaturaId = item.asignatura?.id?.toString();
                    if (!asigSeccionId || !asigAsignaturaId) return; // Skip invalid
                    batchOperations.push(asigSecCollection.prepareCreate((record: any) => {
                        record._raw.id = item.id.toString();
                        record._raw.docente_id = item.docente?.id?.toString() || docenteId.toString();
                        record._raw.seccion_id = asigSeccionId;
                        record._raw.asignatura_id = asigAsignaturaId;
                    }));
                });

                (data.alumnos || []).forEach((item: any) => {
                    batchOperations.push(alumnoCollection.prepareCreate((record: any) => {
                        record._raw.id = item.id.toString();
                        record._raw.rne = item.rne || '';
                        record._raw.nombre = item.nombre;
                        record._raw.apellido = item.apellido;
                        record._raw.genero = item.genero;
                    }));
                });

                (data.matriculas || []).forEach((item: any) => {
                    const alumnoId = item.alumno?.id?.toString();
                    const seccionIdVal = item.seccion?.id?.toString();
                    if (!alumnoId || !seccionIdVal) return;
                    batchOperations.push(matriculaCollection.prepareCreate((record: any) => {
                        record._raw.id = item.id.toString();
                        record._raw.alumno_id = alumnoId;
                        record._raw.seccion_id = seccionIdVal;
                        record._raw.year = item.year;
                    }));
                });

                // Insert tipo_acumulativos (global catalog)
                (data.tipo_acumulativos || []).forEach((item: any) => {
                    batchOperations.push(tipoAcumulativoCollection.prepareCreate((record: any) => {
                        record._raw.id = item.id.toString();
                        record._raw.descripcion = item.descripcion;
                    }));
                });

                // Insert acumulativos from server (only those not already local with uploaded=false)
                const localAcumulativoIds = new Set(
                    (await acumulativoCollection.query(Q.where('uploaded', false)).fetch()).map((a: any) => a.id)
                );
                (data.acumulativos || []).forEach((item: any) => {
                    const serverId = item.id?.toString();
                    const acumSeccionId = item.seccion?.id?.toString();
                    const acumAsignaturaId = item.asignatura?.id?.toString();
                    if (!serverId || !acumSeccionId || !acumAsignaturaId) return;
                    if (localAcumulativoIds.has(serverId)) return;
                    batchOperations.push(acumulativoCollection.prepareCreate((record: any) => {
                        record._raw.id = serverId;
                        record._raw.seccion_id = acumSeccionId;
                        record._raw.asignatura_id = acumAsignaturaId;
                        record._raw.tipo_acumulativo_id = item.tipoAcumulativo?.id?.toString() || '';
                        record._raw.descripcion = item.descripcion;
                        record._raw.fecha = item.fecha;
                        record._raw.valor = item.valor;
                        record._raw.parcial = item.parcial || 1;
                        record._raw.uploaded = true;
                    }));
                });

                // Insert notas_acumulativos from server
                const localNotaIds = new Set(
                    (await notaAcumulativoCollection.query(Q.where('uploaded', false)).fetch()).map((n: any) => n.id)
                );
                (data.notas_acumulativos || []).forEach((item: any) => {
                    const serverId = item.id?.toString();
                    const notaAlumnoId = item.alumno?.id?.toString();
                    const notaAcumId = item.acumulativo?.id?.toString();
                    if (!serverId || !notaAlumnoId || !notaAcumId) return;
                    if (localNotaIds.has(serverId)) return;
                    batchOperations.push(notaAcumulativoCollection.prepareCreate((record: any) => {
                        record._raw.id = serverId;
                        record._raw.alumno_id = notaAlumnoId;
                        record._raw.acumulativo_id = notaAcumId;
                        record._raw.nota = item.nota;
                        record._raw.uploaded = true;
                    }));
                });

                // Pasar el array directo (no spread) evita "Maximum callstack exceeded" con
                // datasets grandes y la advertencia de rendimiento de WatermelonDB.
                await database.batch(batchOperations);
            });
            console.log('Pull Sync Completed');
            return true;
        } catch (error) {
            console.error('Pull Error', error);
            return false;
        }
    };

    const pushData = async () => {
        try {
            const asistencias = await database.get('asistencias').query(Q.where('uploaded', false)).fetch();
            const acumulativos = await database.get('acumulativos').query(Q.where('uploaded', false)).fetch();
            const notas = await database.get('notas_acumulativos').query(Q.where('uploaded', false)).fetch();

            if (asistencias.length === 0 && acumulativos.length === 0 && notas.length === 0) {
                console.log('Nothing to push');
                return true;
            }

            const payload = {
                asistencias: asistencias.map((a: any) => ({
                    idMovil: a.id,
                    alumnoId: parseInt(a._raw.alumno_id) || 0,
                    asignaturaId: parseInt(a._raw.asignatura_id) || 0,
                    seccionId: parseInt(a._raw.seccion_id) || 0,
                    fecha: a.fecha,
                    estado: a.estado
                })),
                acumulativos: acumulativos.map((a: any) => ({
                    idMovil: a.id,
                    descripcion: a.descripcion,
                    valor: a.valor,
                    fecha: a.fecha,
                    asignaturaId: parseInt(a._raw.asignatura_id) || 0,
                    seccionId: parseInt(a._raw.seccion_id) || 0,
                    parcial: a.parcial || 1,
                    tipoAcumulativoId: a._raw.tipo_acumulativo_id ? parseInt(a._raw.tipo_acumulativo_id) : null
                })),
                notas: notas.map((n: any) => ({
                    idMovil: n.id,
                    alumnoId: parseInt(n._raw.alumno_id) || 0,
                    acumulativoIdMovil: n._raw.acumulativo_id,
                    nota: n.nota
                }))
            };

            await api.post('/sync/push', payload);

            await database.write(async () => {
                const batch = [
                    ...asistencias.map(a => a.prepareUpdate((rec: any) => { rec.uploaded = true; })),
                    ...acumulativos.map(a => a.prepareUpdate((rec: any) => { rec.uploaded = true; })),
                    ...notas.map(n => n.prepareUpdate((rec: any) => { rec.uploaded = true; }))
                ];
                await database.batch(batch);
            });

            console.log('Push Sync Completed');
            return true;

        } catch (error) {
            console.error('Push Error', error);
            return false;
        }
    };

    // Valida que el frontend solo trabaje con datos del PERIODO ACTIVO y del AÑO actual.
    // Poda clases/secciones de periodos cerrados y matrículas de años anteriores que hayan
    // quedado como residuo local. Se llama tras cada login y cada sincronización.
    const reconcileActiveData = async () => {
        try {
            const activos = await database.get('periodos').query(Q.where('estado', true)).fetch();
            const activeIds = new Set(activos.map((p: any) => p.id));
            // Sin periodo activo conocido no se puede validar con seguridad: no se poda nada.
            if (activeIds.size === 0) return { pruned: 0 };

            const year = new Date().getFullYear();

            const secciones = await database.get('secciones').query().fetch();
            const staleSecciones = secciones.filter((s: any) => !activeIds.has(s._raw.periodo_id));
            const staleSeccionIds = new Set(staleSecciones.map((s: any) => s.id));

            const asigSec = await database.get('asignaturas_secciones').query().fetch();
            const staleAsig = asigSec.filter((a: any) => staleSeccionIds.has(a._raw.seccion_id));

            const staleMatriculas = await database.get('matriculas').query(Q.where('year', Q.notEq(year))).fetch();

            const ops = [
                ...staleAsig.map((a: any) => a.prepareDestroyPermanently()),
                ...staleSecciones.map((s: any) => s.prepareDestroyPermanently()),
                ...staleMatriculas.map((m: any) => m.prepareDestroyPermanently()),
            ];
            if (ops.length === 0) return { pruned: 0 };

            await database.write(async () => {
                await database.batch(ops);
            });
            console.log(`reconcileActiveData: podadas ${staleAsig.length} clases, ${staleSecciones.length} secciones y ${staleMatriculas.length} matrículas de periodos/años no activos`);
            return { pruned: ops.length, clases: staleAsig.length };
        } catch (error) {
            console.error('reconcileActiveData error', error);
            return { pruned: 0 };
        }
    };

    return { pullData, pushData, reconcileActiveData };
}
