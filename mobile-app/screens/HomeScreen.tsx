import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { ActionCard, Avatar } from '../components/ui';
import { ClipboardCheck, GraduationCap, Users, BarChart3 } from 'lucide-react-native';

export default function HomeScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const fullName = `${user?.nombre || ''} ${user?.apellido || ''}`.trim();

    return (
        <ScreenWrapper className="bg-surface-50">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header — limpio, sin bloque de color pesado */}
                <View className="px-5 pt-4 pb-6">
                    <View className="flex-row items-center">
                        <Avatar name={fullName} size="lg" />
                        <View className="ml-4 flex-1">
                            <Text
                                className="text-sm text-surface-400"
                                style={{ fontFamily: 'Inter_400Regular' }}
                            >
                                Bienvenido
                            </Text>
                            <Text
                                className="text-xl text-surface-900"
                                style={{ fontFamily: 'Inter_700Bold' }}
                                numberOfLines={1}
                            >
                                {fullName}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Acciones — grid 2x2, iconos claros, textos grandes */}
                <View className="px-5">
                    <Text
                        className="text-sm text-surface-400 mb-3 uppercase tracking-wider"
                        style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                        Acciones
                    </Text>

                    <View className="flex-row mb-3">
                        <View className="flex-1 mr-1.5">
                            <ActionCard
                                title="Asistencia"
                                subtitle="Pasar lista"
                                icon={<ClipboardCheck size={28} color="#16a34a" />}
                                onPress={() => navigation.navigate('Asistencia')}
                            />
                        </View>
                        <View className="flex-1 ml-1.5">
                            <ActionCard
                                title="Calificar"
                                subtitle="Notas y tareas"
                                icon={<GraduationCap size={28} color="#16a34a" />}
                                onPress={() => navigation.navigate('Acumulativos')}
                            />
                        </View>
                    </View>

                    <View className="flex-row mb-3">
                        <View className="flex-1 mr-1.5">
                            <ActionCard
                                title="Alumnos"
                                subtitle="Ver listados"
                                icon={<Users size={28} color="#16a34a" />}
                                onPress={() => navigation.navigate('Alumnos')}
                            />
                        </View>
                        <View className="flex-1 ml-1.5">
                            <ActionCard
                                title="Reportes"
                                subtitle="Proximamente"
                                icon={<BarChart3 size={28} color="#d6d3d1" />}
                                onPress={() => {}}
                                disabled
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
