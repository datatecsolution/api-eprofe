import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { Badge, EmptyState } from '../../components/ui';
import { Inbox } from 'lucide-react-native';

const PARCIAL_LABELS: Record<number, string> = {
    1: '1er Parcial',
    2: '2do Parcial',
    3: '3er Parcial',
    4: '4to Parcial',
};

type StudentSummary = {
    alumnoId: string;
    nombre: string;
    apellido: string;
    rne: string;
    notas: Record<string, number>;
    total: number;
};

export default function GradeSummaryScreen({ navigation, route }: any) {
    const database = useDatabase();
    const { asignaturaId, seccionId, nombreClase, detalleSeccion, parcial } = route.params;

    const [loading, setLoading] = useState(true);
    const [acumulativos, setAcumulativos] = useState<any[]>([]);
    const [students, setStudents] = useState<StudentSummary[]>([]);
    const totalPuntos = acumulativos.reduce((acc, a) => acc + (a.valor || 0), 0);

    useEffect(() => {
        async function loadData() {
            try {
                const acums = await database.get('acumulativos').query(
                    Q.where('asignatura_id', asignaturaId),
                    Q.where('seccion_id', seccionId),
                    Q.where('parcial', parcial)
                ).fetch();
                setAcumulativos(acums);

                const matriculas = await database.get('matriculas').query(
                    Q.where('seccion_id', seccionId)
                ).fetch();

                const acumIds = acums.map(a => a.id);
                let allNotas: any[] = [];
                if (acumIds.length > 0) {
                    allNotas = await database.get('notas_acumulativos').query(
                        Q.where('acumulativo_id', Q.oneOf(acumIds))
                    ).fetch();
                }

                const notaMap: Record<string, Record<string, number>> = {};
                allNotas.forEach((n: any) => {
                    const alumnoId = n._raw.alumno_id;
                    const acumId = n._raw.acumulativo_id;
                    if (!notaMap[alumnoId]) notaMap[alumnoId] = {};
                    notaMap[alumnoId][acumId] = n.nota;
                });

                const summaries: StudentSummary[] = [];
                for (const m of matriculas as any[]) {
                    const alumnoId = m._raw.alumno_id;
                    const alumno = await m.alumno.fetch();
                    const notas = notaMap[alumnoId] || {};
                    const total = Object.values(notas).reduce((acc, n) => acc + n, 0);
                    summaries.push({
                        alumnoId,
                        nombre: alumno.nombre,
                        apellido: alumno.apellido,
                        rne: alumno.rne || '',
                        notas,
                        total,
                    });
                }

                summaries.sort((a, b) => a.apellido.localeCompare(b.apellido));
                setStudents(summaries);
            } catch (e) {
                console.error('Error loading grade summary:', e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-surface-50">
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-surface-50">
            {/* Título nombreClase/detalleSeccion + botón Inicio van en el header nativo del stack.
                Barra fina con el parcial y el total de puntos. */}
            <View className="bg-white px-5 py-3 border-b border-surface-100 flex-row items-center justify-between">
                <Text className="text-sm text-surface-600" style={{ fontFamily: 'Inter_600SemiBold' }}>
                    {PARCIAL_LABELS[parcial]}
                </Text>
                <Badge label={`${totalPuntos}/100 pts`} variant="info" />
            </View>

            {acumulativos.length === 0 ? (
                <EmptyState
                    icon={<Inbox size={32} color="#a8a29e" />}
                    title="Sin evaluaciones"
                    description="Crea evaluaciones para ver el resumen."
                />
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
                    <View>
                        {/* Header row */}
                        <View className="flex-row bg-surface-100 border-b border-surface-200">
                            <View className="w-48 px-4 py-3 border-r border-surface-200">
                                <Text className="text-xs text-surface-600" style={{ fontFamily: 'Inter_600SemiBold' }}>
                                    Alumno
                                </Text>
                            </View>
                            {acumulativos.map((a: any) => (
                                <View key={a.id} className="w-20 px-2 py-3 items-center border-r border-surface-200">
                                    <Text
                                        className="text-xs text-surface-600 text-center"
                                        style={{ fontFamily: 'Inter_600SemiBold' }}
                                        numberOfLines={2}
                                    >
                                        {a.descripcion}
                                    </Text>
                                    <Text className="text-xs text-surface-400 mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>
                                        {a.valor}pts
                                    </Text>
                                </View>
                            ))}
                            <View className="w-20 px-2 py-3 items-center bg-primary-50">
                                <Text className="text-xs text-primary-700" style={{ fontFamily: 'Inter_700Bold' }}>
                                    Total
                                </Text>
                                <Text className="text-xs text-primary-500 mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>
                                    {totalPuntos}pts
                                </Text>
                            </View>
                        </View>

                        {/* Student rows */}
                        <FlatList
                            data={students}
                            keyExtractor={item => item.alumnoId}
                            renderItem={({ item, index }) => (
                                <View className={`flex-row border-b border-surface-100 ${index % 2 === 0 ? 'bg-white' : 'bg-surface-50'}`}>
                                    <View className="w-48 px-4 py-3 border-r border-surface-100 justify-center">
                                        <Text
                                            className="text-sm text-surface-800"
                                            style={{ fontFamily: 'Inter_500Medium' }}
                                            numberOfLines={1}
                                        >
                                            {item.apellido}, {item.nombre}
                                        </Text>
                                    </View>
                                    {acumulativos.map((a: any) => {
                                        const nota = item.notas[a.id];
                                        const hasNota = nota !== undefined;
                                        return (
                                            <View key={a.id} className="w-20 px-2 py-3 items-center justify-center border-r border-surface-100">
                                                <Text
                                                    className={`text-sm ${hasNota ? 'text-surface-800' : 'text-surface-300'}`}
                                                    style={{ fontFamily: 'Inter_600SemiBold' }}
                                                >
                                                    {hasNota ? nota : '—'}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                    <View className="w-20 px-2 py-3 items-center justify-center bg-primary-50">
                                        <Text
                                            className={`text-sm ${item.total > 0 ? 'text-primary-700' : 'text-surface-300'}`}
                                            style={{ fontFamily: 'Inter_700Bold' }}
                                        >
                                            {item.total > 0 ? item.total : '—'}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        />
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
