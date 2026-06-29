import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useRoute } from '@react-navigation/native';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import Alumno from '../../model/Alumno';
import { Avatar, Card } from '../../components/ui';
import { Phone, Calendar, Users } from 'lucide-react-native';

const InfoRow = ({ icon, label, value, isLast = false }: { icon: React.ReactNode; label: string; value: string; isLast?: boolean }) => (
    <View className={`flex-row items-center py-3.5 ${!isLast ? 'border-b border-surface-50' : ''}`}>
        <View className="mr-3">{icon}</View>
        <View className="flex-1">
            <Text className="text-xs text-surface-400" style={{ fontFamily: 'Inter_400Regular' }}>
                {label}
            </Text>
            <Text className="text-base text-surface-800 mt-0.5" style={{ fontFamily: 'Inter_500Medium' }}>
                {value}
            </Text>
        </View>
    </View>
);

export default function StudentDetailScreen() {
    const route = useRoute<any>();
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
        return (
            <View className="flex-1 justify-center items-center bg-surface-50">
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );
    }

    const fullName = `${alumno.nombre} ${alumno.apellido}`;

    return (
        <ScreenWrapper className="bg-surface-50">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="items-center pt-10 pb-6">
                    <Avatar name={fullName} size="xl" />
                    <Text
                        className="text-xl text-surface-900 mt-4"
                        style={{ fontFamily: 'Inter_700Bold' }}
                    >
                        {fullName}
                    </Text>
                    <Text
                        className="text-sm text-surface-400 mt-0.5"
                        style={{ fontFamily: 'Inter_400Regular' }}
                    >
                        {alumno.rne || 'Sin RNE'}
                    </Text>
                </View>

                {/* Info */}
                <View className="px-5">
                    <Text
                        className="text-sm text-surface-400 mb-3 uppercase tracking-wider"
                        style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                        Información
                    </Text>
                    <Card>
                        <InfoRow
                            icon={<Phone size={18} color="#a8a29e" />}
                            label="Teléfono"
                            value={alumno.telefono?.toString() || 'N/A'}
                        />
                        <InfoRow
                            icon={<Calendar size={18} color="#a8a29e" />}
                            label="Fecha de nacimiento"
                            value={alumno.fechaNacimiento ? new Date(alumno.fechaNacimiento).toLocaleDateString() : 'N/A'}
                        />
                        <InfoRow
                            icon={<Users size={18} color="#a8a29e" />}
                            label="Género"
                            value={alumno.genero === 1 ? 'Masculino' : 'Femenino'}
                            isLast
                        />
                    </Card>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
