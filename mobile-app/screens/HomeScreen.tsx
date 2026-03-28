import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
    const { user, signOut } = useAuth();
    const navigation = useNavigation();

    return (
        <ScreenWrapper className="bg-gray-100">
            <StatusBar style="auto" />

            {/* Header */}
            <View className="bg-blue-600 p-6 pt-12 rounded-b-3xl mb-6 shadow-lg">
                <Text className="text-white text-lg opacity-80">Bienvenido,</Text>
                <Text className="text-white text-3xl font-bold mt-1">
                    {user?.nombre} {user?.apellido}
                </Text>
                <Text className="text-white text-sm mt-2 opacity-70">SACE ID: {user?.userSace}</Text>
            </View>

            {/* Quick Actions Grid */}
            <View className="flex-1 px-4">
                <Text className="text-xl font-bold text-gray-800 mb-4 ml-2">Acciones Rápidas</Text>

                <View className="flex-row flex-wrap justify-between">
                    {/* Tomar Asistencia */}
                    <TouchableOpacity
                        className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 items-center justify-center py-8"
                        onPress={() => navigation.navigate('Asistencia')}
                    >
                        <Text className="text-4xl mb-2">📋</Text>
                        <Text className="font-semibold text-gray-700">Asistencia</Text>
                    </TouchableOpacity>

                    {/* Calificar */}
                    <TouchableOpacity
                        className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 items-center justify-center py-8"
                        onPress={() => navigation.navigate('Acumulativos')}
                    >
                        <Text className="text-4xl mb-2">📝</Text>
                        <Text className="font-semibold text-gray-700">Calificar</Text>
                    </TouchableOpacity>

                    {/* Alumnos */}
                    <TouchableOpacity
                        className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 items-center justify-center py-8"
                        onPress={() => navigation.navigate('Alumnos')}
                    >
                        <Text className="text-4xl mb-2">👨‍🎓</Text>
                        <Text className="font-semibold text-gray-700">Alumnos</Text>
                    </TouchableOpacity>

                    {/* Reportes (Placeholder) */}
                    <TouchableOpacity
                        className="w-[48%] bg-gray-100 border-2 border-dashed border-gray-300 p-4 rounded-xl mb-4 items-center justify-center py-8"
                        onPress={() => alert('Próximamente')}
                    >
                        <Text className="text-4xl mb-2 opacity-30">📊</Text>
                        <Text className="font-semibold text-gray-400">Reportes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScreenWrapper>
    );
}
