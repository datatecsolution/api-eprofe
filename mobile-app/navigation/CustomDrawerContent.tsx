import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import { useInitialSync } from '../hooks/useInitialSync';
import { database } from '../model/index';
import { Q } from '@nozbe/watermelondb';
import Toast from 'react-native-toast-message';

export default function CustomDrawerContent(props: any) {
    const { user, signOut } = useAuth();
    const { pushData, pullData } = useInitialSync();
    const [syncing, setSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    // Count pending (unuploaded) records
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
            // 1. Push Changes first (always push before pull to avoid losing data)
            const pushSuccess = await pushData();
            if (!pushSuccess) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Falló la subida de datos. Verifique su conexión.'
                });
                setSyncing(false);
                return;
            }

            // 2. Pull Updates
            const pullSuccess = await pullData(user.id, user.cookies);
            if (!pullSuccess) {
                Toast.show({
                    type: 'info',
                    text1: 'Advertencia',
                    text2: 'Datos subidos, pero falló la descarga.'
                });
            } else {
                Toast.show({
                    type: 'success',
                    text1: 'Éxito',
                    text2: 'Sincronización completada correctamente.'
                });
            }

        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Ocurrió un error inesperado.'
            });
        } finally {
            setSyncing(false);
            countPending();
        }
    };

    const handleSignOut = async () => {
        if (pendingCount > 0) {
            Alert.alert(
                'Datos sin sincronizar',
                `Tienes ${pendingCount} registro(s) sin subir al servidor. Si cierras sesión se perderán.\n\n¿Deseas sincronizar antes de salir?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Sincronizar y salir',
                        onPress: async () => {
                            await pushData();
                            await signOut();
                        },
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
                '¿Estás seguro que deseas cerrar sesión?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Cerrar sesión', style: 'destructive', onPress: () => signOut() },
                ]
            );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="p-4 border-b border-gray-100 bg-blue-600 pt-10">
                <View className="h-16 w-16 bg-white rounded-full items-center justify-center mb-3">
                    <Text className="text-blue-600 text-2xl font-bold">
                        {user?.nombre?.charAt(0) || 'U'}
                    </Text>
                </View>
                <Text className="text-white text-lg font-bold">{user?.nombre} {user?.apellido}</Text>
                <Text className="text-blue-100 text-sm">{user?.email || user?.userSace}</Text>
            </View>

            <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>

            <View className="p-4 border-t border-gray-100">
                <TouchableOpacity
                    className={`flex-row items-center justify-center p-3 rounded-lg mb-3 ${syncing ? 'bg-gray-100' : 'bg-blue-50'}`}
                    onPress={handleSync}
                    disabled={syncing}
                >
                    {syncing ? <ActivityIndicator size="small" color="#2563eb" /> : null}
                    <Text className={`font-bold ml-2 ${syncing ? 'text-gray-500' : 'text-blue-600'}`}>
                        {syncing ? 'Sincronizando...' : 'Sincronizar Datos'}
                    </Text>
                    {pendingCount > 0 && !syncing && (
                        <View className="bg-red-500 rounded-full w-6 h-6 items-center justify-center ml-2">
                            <Text className="text-white text-xs font-bold">{pendingCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    className="p-3 rounded-lg bg-red-50 items-center"
                    onPress={handleSignOut}
                >
                    <Text className="text-red-600 font-bold">Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
