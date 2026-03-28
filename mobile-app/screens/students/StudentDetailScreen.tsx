import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import Alumno from '../../model/Alumno';

export default function StudentDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const database = useDatabase();
    const { alumnoId } = route.params;

    const [alumno, setAlumno] = useState<Alumno | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const record = await database.get('alumnos').find(alumnoId);
                setAlumno(record as Alumno);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [alumnoId]);

    if (loading || !alumno) {
        return <View className="flex-1 justify-center items-center"><ActivityIndicator /></View>;
    }

    return (
        <ScreenWrapper className="bg-gray-50">
            <View className="bg-blue-600 p-6 items-center pt-10">
                <View className="h-24 w-24 bg-white rounded-full items-center justify-center mb-4">
                    <Text className="text-blue-600 font-bold text-4xl">{alumno.nombre.charAt(0)}</Text>
                </View>
                <Text className="text-white text-2xl font-bold">{alumno.nombre} {alumno.apellido}</Text>
                <Text className="text-blue-100 text-lg">{alumno.rne || 'Sin RNE'}</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <Text className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Información Personal</Text>

                    <InfoRow label="Teléfono" value={alumno.telefono?.toString() || 'N/A'} />
                    <InfoRow label="Fecha Nacimiento" value={alumno.fechaNacimiento ? new Date(alumno.fechaNacimiento).toLocaleDateString() : 'N/A'} />
                    <InfoRow label="Género" value={alumno.genero === 1 ? 'Masculino' : 'Femenino'} />
                </View>

                {/* Future: Add Academic History or Attendance Summary here */}
            </ScrollView>

            <View className="p-4">
                <TouchableOpacity
                    className="bg-gray-200 p-4 rounded-lg items-center"
                    onPress={() => navigation.goBack()}
                >
                    <Text className="text-gray-800 font-bold">Volver</Text>
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
}

const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <View className="flex-row justify-between py-2 border-b border-gray-50">
        <Text className="text-gray-500 font-medium">{label}</Text>
        <Text className="text-gray-800 font-bold">{value}</Text>
    </View>
);
