import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import { useInitialSync } from '../hooks/useInitialSync';
import { database } from '../model/index';
import { Q } from '@nozbe/watermelondb';
import { Avatar } from '../components/ui';
import { RefreshCw, LogOut } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

export default function CustomDrawerContent(props: any) {
    const { user, signOut } = useAuth();
    const { pushData, pullData } = useInitialSync();
    const [syncing, setSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    const fullName = `${user?.nombre || ''} ${user?.apellido || ''}`.trim();

    const countPending = async () => {
        try {
            const asistencias = await database.get('asistencias').query(Q.where('uploaded', false)).fetchCount();
            const acumulativos = await database.get('acumulativos').query(Q.where('uploaded', false)).fetchCount();
            const notas = await database.get('notas_acumulativos').query(Q.where('uploaded', false)).fetchCount();
            setPendingCount(asistencias + acumulativos + notas);
        } catch (e) {
            setPendingCount(0);
        }
    };

    useEffect(() => {
        countPending();
    }, [syncing]);

    const handleSync = async () => {
        if (!user) return;
        setSyncing(true);
        try {
            const pushSuccess = await pushData();
            if (!pushSuccess) {
                Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron subir los datos.' });
                setSyncing(false);
                return;
            }

            const pullSuccess = await pullData(user.id, user.cookies);
            if (!pullSuccess) {
                Toast.show({ type: 'info', text1: 'Aviso', text2: 'Datos subidos, pero no se pudo descargar.' });
            } else {
                Toast.show({ type: 'success', text1: 'Listo', text2: 'Todo sincronizado.' });
            }
        } catch (error) {
            console.error(error);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Algo salió mal.' });
        } finally {
            setSyncing(false);
            countPending();
        }
    };

    const handleSignOut = async () => {
        if (pendingCount > 0) {
            Alert.alert(
                'Datos sin sincronizar',
                `Tienes ${pendingCount} registro(s) sin subir. Si cierras sesión se perderán.`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Sincronizar y salir',
                        onPress: async () => { await pushData(); await signOut(); },
                    },
                    {
                        text: 'Salir sin sincronizar',
                        style: 'destructive',
                        onPress: () => signOut(),
                    },
                ]
            );
        } else {
            Alert.alert(
                'Cerrar sesión',
                '¿Seguro que deseas salir?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Salir', style: 'destructive', onPress: () => signOut() },
                ]
            );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Profile header */}
            <View className="px-5 pt-10 pb-5 border-b border-surface-100">
                <Avatar name={fullName} size="lg" />
                <Text
                    className="text-lg text-surface-900 mt-3"
                    style={{ fontFamily: 'Inter_700Bold' }}
                >
                    {fullName}
                </Text>
                <Text
                    className="text-sm text-surface-400 mt-0.5"
                    style={{ fontFamily: 'Inter_400Regular' }}
                >
                    {user?.email || user?.userSace}
                </Text>
            </View>

            {/* Nav items */}
            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 8 }}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>

            {/* Footer actions */}
            <View className="px-4 pb-6 pt-2 border-t border-surface-100">
                {/* Sync button */}
                <TouchableOpacity
                    className={`flex-row items-center justify-center py-3.5 rounded-2xl mb-3 ${syncing ? 'bg-surface-100' : 'bg-primary-50'}`}
                    onPress={handleSync}
                    disabled={syncing}
                    activeOpacity={0.7}
                >
                    {syncing ? (
                        <ActivityIndicator size="small" color="#16a34a" />
                    ) : (
                        <RefreshCw size={18} color="#16a34a" />
                    )}
                    <Text
                        className={`ml-2 ${syncing ? 'text-surface-400' : 'text-primary-700'}`}
                        style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                        {syncing ? 'Sincronizando...' : 'Sincronizar'}
                    </Text>
                    {pendingCount > 0 && !syncing && (
                        <View className="bg-danger rounded-full min-w-[22px] h-[22px] items-center justify-center ml-2 px-1.5">
                            <Text className="text-white text-xs" style={{ fontFamily: 'Inter_700Bold' }}>
                                {pendingCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity
                    className="flex-row items-center justify-center py-3.5 rounded-2xl"
                    onPress={handleSignOut}
                    activeOpacity={0.7}
                >
                    <LogOut size={18} color="#ef4444" />
                    <Text className="text-danger ml-2" style={{ fontFamily: 'Inter_600SemiBold' }}>
                        Cerrar sesión
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
