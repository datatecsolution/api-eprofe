import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import { Q } from '@nozbe/watermelondb';
import { Card, EmptyState } from '../../components/ui';
import { Calendar, Inbox } from 'lucide-react-native';

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
            `¿Eliminar la asistencia del ${formatDateDisplay(fecha)}?`,
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

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-surface-50">
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-surface-50">
            {/* Header */}
            <View className="bg-white px-5 pt-10 pb-4 border-b border-surface-100">
                <Text className="text-xl text-surface-900" style={{ fontFamily: 'Inter_700Bold' }}>
                    {nombreClase}
                </Text>
                <Text className="text-sm text-surface-400 mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>
                    {detalleSeccion} — Historial
                </Text>
            </View>

            {history.length === 0 ? (
                <EmptyState
                    icon={<Inbox size={32} color="#a8a29e" />}
                    title="Sin registros"
                    description="Aún no has pasado lista para esta clase."
                />
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={item => item.fecha}
                    contentContainerStyle={{ padding: 20 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <Card
                            className="mb-3"
                            onPress={() => handlePress(item.fecha)}
                        >
                            <TouchableOpacity
                                onLongPress={() => handleDelete(item.fecha)}
                                activeOpacity={1}
                            >
                                <View className="flex-row justify-between items-center mb-3">
                                    <View className="flex-row items-center">
                                        <Calendar size={16} color="#78716c" />
                                        <Text
                                            className="text-base text-surface-800 ml-2"
                                            style={{ fontFamily: 'Inter_600SemiBold' }}
                                        >
                                            {formatDateDisplay(item.fecha)}
                                        </Text>
                                    </View>
                                    <Text
                                        className="text-sm text-surface-400"
                                        style={{ fontFamily: 'Inter_400Regular' }}
                                    >
                                        {item.total} alumnos
                                    </Text>
                                </View>

                                {/* Status bar visual */}
                                <View className="flex-row h-2 rounded-full overflow-hidden mb-3">
                                    {item.presentes > 0 && (
                                        <View
                                            className="bg-green-500 h-full"
                                            style={{ flex: item.presentes }}
                                        />
                                    )}
                                    {item.ausentes > 0 && (
                                        <View
                                            className="bg-red-500 h-full"
                                            style={{ flex: item.ausentes }}
                                        />
                                    )}
                                    {item.excusados > 0 && (
                                        <View
                                            className="bg-amber-500 h-full"
                                            style={{ flex: item.excusados }}
                                        />
                                    )}
                                </View>

                                <View className="flex-row">
                                    <View className="flex-row items-center mr-5">
                                        <View className="w-2.5 h-2.5 rounded-full bg-green-500 mr-1.5" />
                                        <Text className="text-sm text-surface-600" style={{ fontFamily: 'Inter_500Medium' }}>
                                            {item.presentes}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center mr-5">
                                        <View className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5" />
                                        <Text className="text-sm text-surface-600" style={{ fontFamily: 'Inter_500Medium' }}>
                                            {item.ausentes}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <View className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5" />
                                        <Text className="text-sm text-surface-600" style={{ fontFamily: 'Inter_500Medium' }}>
                                            {item.excusados}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Card>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

export default withDatabase(AttendanceHistoryScreen);
