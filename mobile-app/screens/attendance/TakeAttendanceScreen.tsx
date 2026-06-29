import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import { Q } from '@nozbe/watermelondb';
import Matricula from '../../model/Matricula';
import Alumno from '../../model/Alumno';
import AsignaturaSeccion from '../../model/AsignaturaSeccion';
import { Avatar, Button } from '../../components/ui';
import { ChevronLeft, ChevronRight, Check, X, AlertTriangle } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const formatDateDisplay = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d} ${months[parseInt(m) - 1]} ${y}`;
};

const statusConfig = {
    P: { bg: 'bg-green-500', bgInactive: 'bg-surface-100', label: 'P', icon: Check, color: '#22c55e' },
    A: { bg: 'bg-red-500', bgInactive: 'bg-surface-100', label: 'A', icon: X, color: '#ef4444' },
    E: { bg: 'bg-amber-500', bgInactive: 'bg-surface-100', label: 'E', icon: AlertTriangle, color: '#f59e0b' },
};

const StudentRow = ({ matricula, status, onChangeStatus }: any) => {
    const [alumno, setAlumno] = useState<Alumno | null>(null);

    useEffect(() => {
        matricula.alumno.fetch().then(setAlumno);
    }, []);

    if (!alumno) return <ActivityIndicator size="small" className="py-4" />;

    const fullName = `${alumno.nombre} ${alumno.apellido}`;

    return (
        <View className="flex-row items-center bg-white px-5 py-3.5 border-b border-surface-100">
            <Avatar name={fullName} size="sm" />
            <View className="flex-1 ml-3">
                <Text
                    className="text-base text-surface-800"
                    style={{ fontFamily: 'Inter_500Medium' }}
                    numberOfLines={1}
                >
                    {fullName}
                </Text>
            </View>

            {/* Touch targets de 48px+ para facilitar el toque */}
            <View className="flex-row">
                {(['P', 'A', 'E'] as const).map((opt) => {
                    const config = statusConfig[opt];
                    const isActive = status === opt;
                    return (
                        <TouchableOpacity
                            key={opt}
                            onPress={() => onChangeStatus(matricula.id, opt)}
                            activeOpacity={0.6}
                            className={`w-12 h-12 rounded-2xl items-center justify-center ml-2 ${isActive ? config.bg : config.bgInactive}`}
                        >
                            <Text
                                className={`text-base ${isActive ? 'text-white' : 'text-surface-400'}`}
                                style={{ fontFamily: 'Inter_700Bold' }}
                            >
                                {config.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

function TakeAttendanceScreen({ database }: { database: any }) {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { asignaturaSeccionId, nombreClase, detalleSeccion, initialDate } = route.params;

    const [loading, setLoading] = useState(true);
    const [matriculas, setMatriculas] = useState<Matricula[]>([]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
    const [asignaturaSeccion, setAsignaturaSeccion] = useState<AsignaturaSeccion | null>(null);
    const [selectedDate, setSelectedDate] = useState(initialDate || formatDate(new Date()));

    const loadData = async (fecha: string) => {
        setLoading(true);
        try {
            const asigSeccionRecord = await database.get('asignaturas_secciones').find(asignaturaSeccionId);
            setAsignaturaSeccion(asigSeccionRecord);

            const seccion = await asigSeccionRecord.seccion.fetch();
            const matriculasData = await database.get('matriculas')
                .query(Q.where('seccion_id', seccion.id), Q.where('year', new Date().getFullYear()))
                .fetch();

            setMatriculas(matriculasData);

            const existingAttendance = await database.get('asistencias')
                .query(
                    Q.where('asignatura_id', asigSeccionRecord._raw.asignatura_id),
                    Q.where('seccion_id', asigSeccionRecord._raw.seccion_id),
                    Q.where('fecha', fecha)
                )
                .fetch();

            const existingByAlumno: Record<string, string> = {};
            existingAttendance.forEach((a: any) => {
                existingByAlumno[a._raw.alumno_id] = a.estado;
            });

            const initialMap: any = {};
            matriculasData.forEach((m: any) => {
                initialMap[m.id] = existingByAlumno[m._raw.alumno_id] || 'P';
            });
            setAttendanceMap(initialMap);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudieron cargar los alumnos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(selectedDate);
    }, [asignaturaSeccionId]);

    const changeDate = (offsetDays: number) => {
        const current = new Date(selectedDate + 'T12:00:00');
        current.setDate(current.getDate() + offsetDays);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (current > today) return;
        const newDate = formatDate(current);
        setSelectedDate(newDate);
        loadData(newDate);
    };

    const isToday = selectedDate === formatDate(new Date());

    const handleStatusChange = (matriculaId: string, newStatus: string) => {
        setAttendanceMap(prev => ({ ...prev, [matriculaId]: newStatus }));
    };

    const saveAttendance = async () => {
        if (!asignaturaSeccion) return;
        setLoading(true);
        try {
            const asignaturaId = (asignaturaSeccion as any)._raw.asignatura_id;
            const seccionId = (asignaturaSeccion as any)._raw.seccion_id;

            const existingAttendance = await database.get('asistencias')
                .query(
                    Q.where('asignatura_id', asignaturaId),
                    Q.where('seccion_id', seccionId),
                    Q.where('fecha', selectedDate)
                )
                .fetch();

            const existingByAlumno: Record<string, any> = {};
            existingAttendance.forEach((a: any) => {
                existingByAlumno[a._raw.alumno_id] = a;
            });

            await database.write(async () => {
                const batchOps = matriculas.map((m: any) => {
                    const alumnoId = m._raw.alumno_id;
                    const status = attendanceMap[m.id];
                    const existing = existingByAlumno[alumnoId];

                    if (existing) {
                        return existing.prepareUpdate((rec: any) => {
                            rec.estado = status;
                            rec.uploaded = false;
                        });
                    } else {
                        return database.get('asistencias').prepareCreate((record: any) => {
                            record._raw.alumno_id = alumnoId;
                            record._raw.asignatura_id = asignaturaId;
                            record._raw.seccion_id = seccionId;
                            record.fecha = selectedDate;
                            record.estado = status;
                            record.uploaded = false;
                        });
                    }
                });
                await database.batch(...batchOps);
            });

            Toast.show({ type: 'success', text1: 'Listo', text2: 'Asistencia guardada' });
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar' });
        } finally {
            setLoading(false);
        }
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
                    {detalleSeccion}
                </Text>

                {/* Date selector */}
                <View className="flex-row items-center justify-between mt-4 bg-surface-50 rounded-2xl p-1">
                    <TouchableOpacity
                        className="h-12 w-12 rounded-xl items-center justify-center"
                        onPress={() => changeDate(-1)}
                        activeOpacity={0.6}
                    >
                        <ChevronLeft size={24} color="#44403c" />
                    </TouchableOpacity>

                    <View className="items-center">
                        <Text className="text-base text-surface-800" style={{ fontFamily: 'Inter_600SemiBold' }}>
                            {formatDateDisplay(selectedDate)}
                        </Text>
                        {isToday && (
                            <Text className="text-xs text-primary-600" style={{ fontFamily: 'Inter_500Medium' }}>
                                Hoy
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        className={`h-12 w-12 rounded-xl items-center justify-center ${isToday ? 'opacity-30' : ''}`}
                        onPress={() => changeDate(1)}
                        disabled={isToday}
                        activeOpacity={0.6}
                    >
                        <ChevronRight size={24} color="#44403c" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Student list */}
            <FlatList
                data={matriculas}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <StudentRow
                        matricula={item}
                        status={attendanceMap[item.id]}
                        onChangeStatus={handleStatusChange}
                    />
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            {/* Fixed bottom CTA */}
            <View className="absolute bottom-0 w-full px-5 py-4 bg-white border-t border-surface-100">
                <Button title="Guardar Asistencia" onPress={saveAttendance} size="lg" />
            </View>
        </SafeAreaView>
    );
}

export default withDatabase(TakeAttendanceScreen);
