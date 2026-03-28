import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import { Q } from '@nozbe/watermelondb';
import Matricula from '../../model/Matricula';
import Alumno from '../../model/Alumno';
import AsignaturaSeccion from '../../model/AsignaturaSeccion';
import Toast from 'react-native-toast-message';

// Format date to YYYY-MM-DD
const formatDate = (date: Date) => date.toISOString().split('T')[0];

// Format date for display
const formatDateDisplay = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
};

// Individual Student Row Component
const StudentRow = ({ matricula, status, onChangeStatus }: any) => {
    const [alumno, setAlumno] = useState<Alumno | null>(null);

    useEffect(() => {
        matricula.alumno.fetch().then(setAlumno);
    }, []);

    if (!alumno) return <ActivityIndicator size="small" />;

    return (
        <View className="flex-row items-center justify-between bg-white p-4 mb-2 border-b border-gray-100">
            <View className="flex-1">
                <Text className="text-lg text-gray-800 font-medium">{alumno.nombre} {alumno.apellido}</Text>
                <Text className="text-gray-500 text-xs">{alumno.rne || 'Sin RNE'}</Text>
            </View>

            <View className="flex-row">
                {['P', 'A', 'E'].map((opt) => (
                    <TouchableOpacity
                        key={opt}
                        onPress={() => onChangeStatus(matricula.id, opt)}
                        className={`w-10 h-10 rounded-full items-center justify-center ml-2 ${status === opt ? (opt === 'P' ? 'bg-green-500' : opt === 'A' ? 'bg-red-500' : 'bg-yellow-500') : 'bg-gray-200'
                            }`}
                    >
                        <Text className={`font-bold ${status === opt ? 'text-white' : 'text-gray-600'}`}>
                            {opt}
                        </Text>
                    </TouchableOpacity>
                ))}
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

            // Fetch Matriculas for this Section
            const matriculasData = await database.get('matriculas')
                .query(Q.where('seccion_id', seccion.id), Q.where('year', new Date().getFullYear()))
                .fetch();

            setMatriculas(matriculasData);

            // Load existing attendance for selected date
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

            // Pre-fill with existing data or default to 'P'
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

    // Change date by offset days
    const changeDate = (offsetDays: number) => {
        const current = new Date(selectedDate + 'T12:00:00');
        current.setDate(current.getDate() + offsetDays);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (current > today) return; // Don't allow future dates
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

            // Load existing attendance for selected date to do upsert
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

            Toast.show({
                type: 'success',
                text1: 'Éxito',
                text2: 'Asistencia guardada correctamente',
            });
            navigation.goBack();

        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Falló al guardar asistencia',
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></View>;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-blue-600 p-4 pt-10">
                <Text className="text-white text-xl font-bold">{nombreClase}</Text>
                <Text className="text-blue-100">{detalleSeccion}</Text>

                {/* Date selector */}
                <View className="flex-row items-center justify-between mt-3 bg-blue-700 rounded-lg p-2">
                    <TouchableOpacity
                        className="px-3 py-1"
                        onPress={() => changeDate(-1)}
                    >
                        <Text className="text-white text-2xl font-bold">&lt;</Text>
                    </TouchableOpacity>

                    <View className="items-center">
                        <Text className="text-white font-bold text-lg">{formatDateDisplay(selectedDate)}</Text>
                        {isToday && <Text className="text-blue-200 text-xs">Hoy</Text>}
                    </View>

                    <TouchableOpacity
                        className={`px-3 py-1 ${isToday ? 'opacity-30' : ''}`}
                        onPress={() => changeDate(1)}
                        disabled={isToday}
                    >
                        <Text className="text-white text-2xl font-bold">&gt;</Text>
                    </TouchableOpacity>
                </View>
            </View>

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
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            <View className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-200">
                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-lg items-center"
                    onPress={saveAttendance}
                >
                    <Text className="text-white font-bold text-lg">Guardar Asistencia</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

export default withDatabase(TakeAttendanceScreen);
