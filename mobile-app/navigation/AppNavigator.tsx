import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import MainNavigator from './MainNavigator';
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import TakeAttendanceScreen from '../screens/attendance/TakeAttendanceScreen';
import ClassGradesScreen from '../screens/grades/ClassGradesScreen';
import CreateGradeScreen from '../screens/grades/CreateGradeScreen';
import GradeDetailScreen from '../screens/grades/GradeDetailScreen';
import StudentDetailScreen from '../screens/students/StudentDetailScreen';
import AttendanceHistoryScreen from '../screens/attendance/AttendanceHistoryScreen';
import GradeSummaryScreen from '../screens/grades/GradeSummaryScreen';
import { useInitialSync } from '../hooks/useInitialSync';
import { database } from '../model/index';

const Stack = createNativeStackNavigator();

function InitialSyncGate({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { pullData } = useInitialSync();
    const [syncing, setSyncing] = useState(false);
    const [checked, setChecked] = useState(false);
    const [error, setError] = useState(false);

    const doSync = async () => {
        if (!user) return;
        setError(false);
        try {
            const count = await database.get('secciones').query().fetchCount();
            if (count === 0) {
                setSyncing(true);
                // If cookies exist → full SACE sync, otherwise → pull from API
                const success = await pullData(user.id, user.cookies);
                setSyncing(false);
                if (!success) {
                    setError(true);
                    return;
                }
            }
            setChecked(true);
        } catch (err) {
            console.error('Initial sync error', err);
            setSyncing(false);
            setError(true);
        }
    };

    useEffect(() => {
        if (!checked && !syncing) {
            doSync();
        }
    }, [user]);

    if (syncing) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="text-gray-600 mt-4 text-lg">Descargando datos...</Text>
                <Text className="text-gray-400 mt-1">Esto solo ocurre la primera vez</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center bg-white p-8">
                <Text className="text-red-500 text-xl font-bold mb-2">Error de sincronización</Text>
                <Text className="text-gray-500 text-center mb-6">No se pudieron descargar los datos. Verifique su conexión a internet.</Text>
                <TouchableOpacity
                    className="bg-blue-600 px-8 py-4 rounded-lg"
                    onPress={doSync}
                >
                    <Text className="text-white font-bold text-lg">Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return <>{children}</>;
}

export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <>
                        <Stack.Screen name="Main">
                            {() => (
                                <InitialSyncGate>
                                    <MainNavigator />
                                </InitialSyncGate>
                            )}
                        </Stack.Screen>
                        <Stack.Screen name="TakeAttendance" component={TakeAttendanceScreen} />
                        <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
                        <Stack.Screen name="ClassGrades" component={ClassGradesScreen} />
                        <Stack.Screen name="CreateGrade" component={CreateGradeScreen} />
                        <Stack.Screen name="GradeDetail" component={GradeDetailScreen} />
                        <Stack.Screen name="GradeSummary" component={GradeSummaryScreen} />
                        <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
                    </>
                ) : (
                    <Stack.Screen name="Login" component={LoginScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
