import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import { Q } from '@nozbe/watermelondb';

const formatDateDisplay = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d} ${months[parseInt(m) - 1]} ${y}`;
};

interface AttendanceSummary {
    fecha: string;
    total: number;
    presentes: number;
    ausentes: number;
    excusados: number;
}

function AttendanceHistoryScreen({ database }: { database: any }) {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { asignaturaSeccionId, nombreClase, detalleSeccion, asignaturaId, seccionId } = route.params;

    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<AttendanceSummary[]>([]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const asistencias = await database.get('asistencias')
                .query(
                    Q.where('asignatura_id', asignaturaId),
                    Q.where('seccion_id', seccionId)
                )
                .fetch();

            // Group by fecha
            const byDate: Record<string, any[]> = {};
            asistencias.forEach((a: any) => {
                if (!byDate[a.fecha]) byDate[a.fecha] = [];
                byDate[a.fecha].push(a);
            });

            const summaries: AttendanceSummary[] = Object.entries(byDate)
                .map(([fecha, records]) => ({
                    fecha,
                    total: records.length,
                    presentes: records.filter(r => r.estado === 'P').length,
                    ausentes: records.filter(r => r.estado === 'A').length,
                    excusados: records.filter(r => r.estado === 'E').length,
                }))
                .sort((a, b) => b.fecha.localeCompare(a.fecha));

            setHistory(summaries);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handlePress = (fecha: string) => {
        // Navigate to TakeAttendance with a specific date pre-selected
        navigation.navigate('TakeAttendance', {
            asignaturaSeccionId,
            nombreClase,
            detalleSeccion,
            initialDate: fecha,
        });
    };

    const handleDelete = (fecha: string) => {
        Alert.alert(
            'Eliminar asistencia',
            `¿Eliminar toda la asistencia del ${formatDateDisplay(fecha)}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const records = await database.get('asistencias')
                                .query(
                                    Q.where('asignatura_id', asignaturaId),
                                    Q.where('seccion_id', seccionId),
                                    Q.where('fecha', fecha)
                                )
                                .fetch();

                            await database.write(async () => {
                                const batch = records.map((r: any) => r.prepareDestroyPermanently());
                                await database.batch(...batch);
                            });
                            loadHistory();
                        } catch (e) {
                            console.error(e);
                            Alert.alert('Error', 'No se pudo eliminar');
                        }
                    },
                },
            ]
        );
    };

    if (loading) return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></View>;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-blue-600 p-4 pt-10">
                <Text className="text-white text-xl font-bold">{nombreClase}</Text>
                <Text className="text-blue-100">{detalleSeccion}</Text>
                <Text className="text-blue-200 text-sm mt-1">Historial de Asistencia</Text>
            </View>

            {history.length === 0 ? (
                <View className="flex-1 justify-center items-center p-8">
                    <Text className="text-gray-400 text-lg">No hay asistencia registrada</Text>
                    <Text className="text-gray-300 text-sm mt-1">Tome asistencia desde la pantalla anterior</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={item => item.fecha}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="bg-white p-4 mb-3 rounded-lg border border-gray-100"
                            onPress={() => handlePress(item.fecha)}
                            onLongPress={() => handleDelete(item.fecha)}
                        >
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-lg font-bold text-gray-800">
                                    {formatDateDisplay(item.fecha)}
                                </Text>
                                <Text className="text-gray-400 text-sm">{item.total} alumnos</Text>
                            </View>
                            <View className="flex-row">
                                <View className="flex-row items-center mr-4">
                                    <View className="w-3 h-3 rounded-full bg-green-500 mr-1" />
                                    <Text className="text-gray-600 text-sm">{item.presentes} P</Text>
                                </View>
                                <View className="flex-row items-center mr-4">
                                    <View className="w-3 h-3 rounded-full bg-red-500 mr-1" />
                                    <Text className="text-gray-600 text-sm">{item.ausentes} A</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <View className="w-3 h-3 rounded-full bg-yellow-500 mr-1" />
                                    <Text className="text-gray-600 text-sm">{item.excusados} E</Text>
                                </View>
                            </View>
                            <Text className="text-gray-300 text-xs mt-2">Toca para editar, mantén presionado para eliminar</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

export default withDatabase(AttendanceHistoryScreen);
