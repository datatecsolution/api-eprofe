import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/hooks';

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
    notas: Record<string, number>; // acumulativoId -> nota
    total: number;
};

export default function GradeSummaryScreen() {
    const route = useRoute<any>();
    const database = useDatabase();
    const { asignaturaId, seccionId, nombreClase, detalleSeccion, parcial } = route.params;

    const [loading, setLoading] = useState(true);
    const [acumulativos, setAcumulativos] = useState<any[]>([]);
    const [students, setStudents] = useState<StudentSummary[]>([]);
    const totalPuntos = acumulativos.reduce((acc, a) => acc + (a.valor || 0), 0);

    useEffect(() => {
        async function loadData() {
            try {
                // 1. Get acumulativos for this parcial
                const acums = await database.get('acumulativos').query(
                    Q.where('asignatura_id', asignaturaId),
                    Q.where('seccion_id', seccionId),
                    Q.where('parcial', parcial)
                ).fetch();
                setAcumulativos(acums);

                // 2. Get matriculas (students) for this section
                const matriculas = await database.get('matriculas').query(
                    Q.where('seccion_id', seccionId)
                ).fetch();

                // 3. Fetch all notas for these acumulativos
                const acumIds = acums.map(a => a.id);
                let allNotas: any[] = [];
                if (acumIds.length > 0) {
                    allNotas = await database.get('notas_acumulativos').query(
                        Q.where('acumulativo_id', Q.oneOf(acumIds))
                    ).fetch();
                }

                // Build nota lookup: alumnoId -> acumulativoId -> nota
                const notaMap: Record<string, Record<string, number>> = {};
                allNotas.forEach((n: any) => {
                    const alumnoId = n._raw.alumno_id;
                    const acumId = n._raw.acumulativo_id;
                    if (!notaMap[alumnoId]) notaMap[alumnoId] = {};
                    notaMap[alumnoId][acumId] = n.nota;
                });

                // 4. Build student summaries
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

                // Sort by apellido
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
        return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></View>;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-blue-600 p-4 pt-10">
                <Text className="text-white text-xl font-bold">{nombreClase}</Text>
                <Text className="text-blue-100">{detalleSeccion} — {PARCIAL_LABELS[parcial]}</Text>
                <Text className="text-blue-200 text-xs mt-1">Total puntos: {totalPuntos}/100</Text>
            </View>

            {acumulativos.length === 0 ? (
                <View className="flex-1 justify-center items-center p-8">
                    <Text className="text-gray-400 text-lg">No hay evaluaciones en este parcial.</Text>
                </View>
            ) : (
                <ScrollView horizontal className="flex-1">
                    <View>
                        {/* Header row */}
                        <View className="flex-row bg-gray-100 border-b border-gray-300">
                            <View className="w-48 p-3 border-r border-gray-200">
                                <Text className="font-bold text-gray-700 text-sm">Alumno</Text>
                            </View>
                            {acumulativos.map((a: any) => (
                                <View key={a.id} className="w-20 p-2 items-center border-r border-gray-200">
                                    <Text className="font-bold text-gray-700 text-xs" numberOfLines={2}>
                                        {a.descripcion}
                                    </Text>
                                    <Text className="text-gray-400 text-xs">{a.valor}pts</Text>
                                </View>
                            ))}
                            <View className="w-20 p-2 items-center bg-blue-50">
                                <Text className="font-bold text-blue-700 text-xs">Total</Text>
                                <Text className="text-blue-400 text-xs">{totalPuntos}pts</Text>
                            </View>
                        </View>

                        {/* Student rows */}
                        <FlatList
                            data={students}
                            keyExtractor={item => item.alumnoId}
                            renderItem={({ item, index }) => (
                                <View className={`flex-row border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <View className="w-48 p-3 border-r border-gray-200 justify-center">
                                        <Text className="text-gray-800 text-sm font-medium" numberOfLines={1}>
                                            {item.apellido}, {item.nombre}
                                        </Text>
                                        <Text className="text-gray-400 text-xs">{item.rne}</Text>
                                    </View>
                                    {acumulativos.map((a: any) => {
                                        const nota = item.notas[a.id];
                                        const hasNota = nota !== undefined;
                                        return (
                                            <View key={a.id} className="w-20 p-2 items-center justify-center border-r border-gray-200">
                                                <Text className={`text-sm font-bold ${hasNota ? 'text-gray-800' : 'text-gray-300'}`}>
                                                    {hasNota ? nota : '—'}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                    <View className="w-20 p-2 items-center justify-center bg-blue-50">
                                        <Text className={`text-sm font-bold ${item.total > 0 ? 'text-blue-700' : 'text-gray-300'}`}>
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
