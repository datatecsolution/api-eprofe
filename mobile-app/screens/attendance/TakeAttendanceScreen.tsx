import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import { Q } from '@nozbe/watermelondb';
import Matricula from '../../model/Matricula';
import Alumno from '../../model/Alumno';
import AsignaturaSeccion from '../../model/AsignaturaSeccion';
import { Avatar, Button } from '../../components/ui';
import { ClockHeaderButton } from '../../components/ui/StackHeader';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const formatDateDisplay = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d} ${months[parseInt(m) - 1]} ${y}`;
};

// Color de fondo del segmento activo (tokens del tema)
const activeBg: Record<string, string> = { P: 'bg-primary-600', A: 'bg-danger', E: 'bg-warning' };

const StudentRow = ({ matricula, status, onChangeStatus }: any) => {
    const [alumno, setAlumno] = useState<Alumno | null>(null);

    useEffect(() => {
        matricula.alumno.fetch().then(setAlumno);
    }, []);

    if (!alumno) return <ActivityIndicator size="small" className="py-4" />;

    const fullName = `${alumno.nombre} ${alumno.apellido}`;

    return (
        <View className="flex-row items-center bg-white px-6 py-3 border-b border-surface-100">
            <Avatar name={fullName} size="sm" />
            <View className="flex-1 mx-3">
                <Text
                    className="text-[15px] text-surface-800"
                    style={{ fontFamily: 'Inter_500Medium' }}
                    numberOfLines={1}
                >
                    {fullName}
                </Text>
            </View>

            {/* Control segmentado P/A/E (touch target ≥44px de alto en la fila) */}
            <View className="flex-row bg-surface-100 rounded-xl p-[3px]">
                {(['P', 'A', 'E'] as const).map((opt) => {
                    const isActive = status === opt;
                    return (
                        <TouchableOpacity
                            key={opt}
                            onPress={() => onChangeStatus(matricula.id, opt)}
                            activeOpacity={0.7}
                            className={`w-9 h-8 rounded-[9px] items-center justify-center ${isActive ? activeBg[opt] : ''}`}
                        >
                            <Text
                                className={`text-sm ${isActive ? 'text-white' : 'text-surface-400'}`}
                                style={{ fontFamily: 'Inter_700Bold' }}
                            >
                                {opt}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

function TakeAttendanceScreen({ database, route, navigation }: { database: any; route: any; navigation: any }) {
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

    const handleHistory = () => {
        if (!asignaturaSeccion) return;
        navigation.navigate('AttendanceHistory', {
            asignaturaSeccionId,
            nombreClase,
            detalleSeccion,
            asignaturaId: (asignaturaSeccion as any)._raw.asignatura_id,
            seccionId: (asignaturaSeccion as any)._raw.seccion_id,
        });
    };

    // Botón de Historial en el header nativo (depende de asignaturaSeccion, por eso se fija aquí).
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <ClockHeaderButton onPress={handleHistory} />,
        });
    }, [navigation, asignaturaSeccion]);

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

    // Conteos derivados para las píldoras de resumen
    const estados = Object.values(attendanceMap);
    const presentes = estados.filter(s => s === 'P').length;
    const ausentes = estados.filter(s => s === 'A').length;
    const excusas = estados.filter(s => s === 'E').length;

    return (
        <SafeAreaView className="flex-1 bg-surface-50">
            {/* Header */}
            <View className="bg-white px-6 pt-3 pb-4.5 border-b border-surface-100">
                {/* Selector de fecha (título de clase + botón Historial van en el header nativo) */}
                <View className="flex-row items-center justify-between bg-surface-50 rounded-2xl p-1.5">
                    <TouchableOpacity
                        className="w-[38px] h-[38px] rounded-xl items-center justify-center bg-white shadow-card"
                        onPress={() => changeDate(-1)}
                        activeOpacity={0.6}
                    >
                        <ChevronLeft size={22} color="#44403c" />
                    </TouchableOpacity>

                    <View className="items-center">
                        <Text className="text-[15px] text-surface-800" style={{ fontFamily: 'Inter_600SemiBold' }}>
                            {formatDateDisplay(selectedDate)}
                        </Text>
                        {isToday && (
                            <Text className="text-xs text-primary-600" style={{ fontFamily: 'Inter_500Medium' }}>
                                Hoy
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        className={`w-[38px] h-[38px] rounded-xl items-center justify-center bg-white shadow-card ${isToday ? 'opacity-30' : ''}`}
                        onPress={() => changeDate(1)}
                        disabled={isToday}
                        activeOpacity={0.6}
                    >
                        <ChevronRight size={22} color="#44403c" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Píldoras de resumen */}
            <View className="flex-row px-6 pt-3 pb-1">
                <View className="bg-primary-100 rounded-full px-3 py-1 mr-2">
                    <Text className="text-xs text-primary-700" style={{ fontFamily: 'Inter_600SemiBold' }}>
                        {presentes} presentes
                    </Text>
                </View>
                <View className="bg-red-100 rounded-full px-3 py-1 mr-2">
                    <Text className="text-xs text-red-700" style={{ fontFamily: 'Inter_600SemiBold' }}>
                        {ausentes} {ausentes === 1 ? 'ausente' : 'ausentes'}
                    </Text>
                </View>
                <View className="bg-amber-100 rounded-full px-3 py-1">
                    <Text className="text-xs text-amber-700" style={{ fontFamily: 'Inter_600SemiBold' }}>
                        {excusas} {excusas === 1 ? 'excusa' : 'excusas'}
                    </Text>
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
            <View className="absolute bottom-0 w-full px-6 pt-4 pb-9 bg-white border-t border-surface-100">
                <Button title="Guardar asistencia" onPress={saveAttendance} size="lg" />
            </View>
        </SafeAreaView>
    );
}

export default withDatabase(TakeAttendanceScreen);
