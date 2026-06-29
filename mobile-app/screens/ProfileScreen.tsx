import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Avatar, Card } from '../components/ui';
import { User, Mail, Hash, CreditCard } from 'lucide-react-native';

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <View className="flex-row items-center py-3.5 border-b border-surface-50">
        <View className="mr-3">{icon}</View>
        <View className="flex-1">
            <Text className="text-xs text-surface-400" style={{ fontFamily: 'Inter_400Regular' }}>
                {label}
            </Text>
            <Text className="text-base text-surface-800 mt-0.5" style={{ fontFamily: 'Inter_500Medium' }}>
                {value || '—'}
            </Text>
        </View>
    </View>
);

export default function ProfileScreen() {
    const { user } = useAuth();
    const fullName = `${user?.nombre || ''} ${user?.apellido || ''}`.trim();

    return (
        <SafeAreaView className="flex-1 bg-surface-50">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Profile header */}
                <View className="items-center pt-8 pb-6">
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
                        {user?.userSace}
                    </Text>
                </View>

                {/* Info card */}
                <View className="px-5">
                    <Text
                        className="text-sm text-surface-400 mb-3 uppercase tracking-wider"
                        style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                        Información
                    </Text>
                    <Card>
                        <InfoRow
                            icon={<User size={18} color="#a8a29e" />}
                            label="Nombre"
                            value={user?.nombre || ''}
                        />
                        <InfoRow
                            icon={<User size={18} color="#a8a29e" />}
                            label="Apellido"
                            value={user?.apellido || ''}
                        />
                        <InfoRow
                            icon={<Mail size={18} color="#a8a29e" />}
                            label="Correo electrónico"
                            value={user?.email || ''}
                        />
                        <InfoRow
                            icon={<CreditCard size={18} color="#a8a29e" />}
                            label="Usuario SACE"
                            value={user?.userSace || ''}
                        />
                        <View className="flex-row items-center py-3.5">
                            <View className="mr-3"><Hash size={18} color="#a8a29e" /></View>
                            <View className="flex-1">
                                <Text className="text-xs text-surface-400" style={{ fontFamily: 'Inter_400Regular' }}>
                                    ID
                                </Text>
                                <Text className="text-base text-surface-800 mt-0.5" style={{ fontFamily: 'Inter_500Medium' }}>
                                    {user?.id?.toString() || '—'}
                                </Text>
                            </View>
                        </View>
                    </Card>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
