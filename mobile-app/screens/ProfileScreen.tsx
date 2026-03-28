import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View className="bg-white p-4 border-b border-gray-100">
        <Text className="text-gray-500 text-xs mb-1">{label}</Text>
        <Text className="text-gray-800 text-lg">{value || '—'}</Text>
    </View>
);

export default function ProfileScreen() {
    const { user } = useAuth();

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-blue-600 p-6 items-center">
                <View className="h-20 w-20 bg-white rounded-full items-center justify-center mb-3">
                    <Text className="text-blue-600 text-3xl font-bold">
                        {user?.nombre?.charAt(0) || 'U'}
                    </Text>
                </View>
                <Text className="text-white text-xl font-bold">{user?.nombre} {user?.apellido}</Text>
                <Text className="text-blue-200">{user?.userSace}</Text>
            </View>

            <ScrollView className="flex-1">
                <Text className="text-gray-500 text-sm font-bold px-4 pt-4 pb-2">Información del Docente</Text>
                <InfoRow label="Nombre" value={user?.nombre || ''} />
                <InfoRow label="Apellido" value={user?.apellido || ''} />
                <InfoRow label="Correo electrónico" value={user?.email || ''} />
                <InfoRow label="Usuario SACE" value={user?.userSace || ''} />
                <InfoRow label="ID" value={user?.id?.toString() || ''} />
            </ScrollView>
        </SafeAreaView>
    );
}
