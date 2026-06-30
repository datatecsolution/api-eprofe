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
import { HeaderTitle, HomeHeaderButton, detailHeaderOptions } from '../components/ui/StackHeader';

const Stack = createNativeStackNavigator();

function InitialSyncGate({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { pullData, reconcileActiveData } = useInitialSync();
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
            // En cada login: validar que los datos locales sean del periodo activo / año actual.
            await reconcileActiveData();
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
            <View className="flex-1 justify-center items-center bg-surface-50">
                <ActivityIndicator size="large" color="#16a34a" />
                <Text
                    className="text-surface-700 mt-4 text-lg"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                    Descargando datos...
                </Text>
                <Text
                    className="text-surface-400 mt-1"
                    style={{ fontFamily: 'Inter_400Regular' }}
                >
                    Esto solo ocurre la primera vez
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center bg-surface-50 p-8">
                <Text
                    className="text-danger text-xl mb-2"
                    style={{ fontFamily: 'Inter_700Bold' }}
                >
                    Error de sincronización
                </Text>
                <Text
                    className="text-surface-400 text-center mb-6"
                    style={{ fontFamily: 'Inter_400Regular' }}
                >
                    No se pudieron descargar los datos. Verifica tu conexión a internet.
                </Text>
                <TouchableOpacity
                    className="bg-primary-600 px-8 py-4 rounded-2xl shadow-button"
                    onPress={doSync}
                    activeOpacity={0.7}
                >
                    <Text className="text-white text-lg" style={{ fontFamily: 'Inter_600SemiBold' }}>
                        Reintentar
                    </Text>
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
            <View className="flex-1 justify-center items-center bg-surface-50">
                <ActivityIndicator size="large" color="#16a34a" />
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
                        <Stack.Screen
                            name="TakeAttendance"
                            component={TakeAttendanceScreen}
                            options={({ route }: any) => ({
                                ...detailHeaderOptions,
                                // El botón de Historial (headerRight) lo fija la pantalla con
                                // navigation.setOptions porque depende de datos cargados en ella.
                                headerTitle: () => (
                                    <HeaderTitle
                                        title={route.params?.nombreClase ?? 'Asistencia'}
                                        subtitle={route.params?.detalleSeccion}
                                    />
                                ),
                            })}
                        />
                        <Stack.Screen
                            name="AttendanceHistory"
                            component={AttendanceHistoryScreen}
                            options={({ route }: any) => ({
                                ...detailHeaderOptions,
                                headerTitle: () => (
                                    <HeaderTitle
                                        title={route.params?.nombreClase ?? 'Historial'}
                                        subtitle={route.params?.detalleSeccion ? `${route.params.detalleSeccion} — Historial` : 'Historial'}
                                    />
                                ),
                            })}
                        />
                        <Stack.Screen
                            name="ClassGrades"
                            component={ClassGradesScreen}
                            options={({ route, navigation }: any) => ({
                                ...detailHeaderOptions,
                                headerTitle: () => (
                                    <HeaderTitle
                                        title={route.params?.nombreClase ?? 'Calificaciones'}
                                        subtitle={route.params?.detalleSeccion}
                                    />
                                ),
                                headerRight: () => (
                                    <HomeHeaderButton onPress={() => navigation.navigate('Main', { screen: 'Inicio' })} />
                                ),
                            })}
                        />
                        <Stack.Screen
                            name="CreateGrade"
                            component={CreateGradeScreen}
                            options={({ route }: any) => ({
                                ...detailHeaderOptions,
                                title: route.params?.editAcumulativoId ? 'Editar evaluación' : 'Nueva evaluación',
                                headerTitleStyle: { fontFamily: 'Inter_700Bold', fontSize: 17, color: '#1c1917' },
                            })}
                        />
                        <Stack.Screen
                            name="GradeDetail"
                            component={GradeDetailScreen}
                            options={({ route, navigation }: any) => ({
                                ...detailHeaderOptions,
                                headerTitle: () => (
                                    <HeaderTitle
                                        title={route.params?.descripcion ?? 'Evaluación'}
                                        subtitle="Ingreso de notas"
                                    />
                                ),
                                headerRight: () => (
                                    <HomeHeaderButton onPress={() => navigation.navigate('Main', { screen: 'Inicio' })} />
                                ),
                            })}
                        />
                        <Stack.Screen
                            name="GradeSummary"
                            component={GradeSummaryScreen}
                            options={({ route, navigation }: any) => ({
                                ...detailHeaderOptions,
                                headerTitle: () => (
                                    <HeaderTitle
                                        title={route.params?.nombreClase ?? 'Resumen'}
                                        subtitle={route.params?.detalleSeccion}
                                    />
                                ),
                                headerRight: () => (
                                    <HomeHeaderButton onPress={() => navigation.navigate('Main', { screen: 'Inicio' })} />
                                ),
                            })}
                        />
                        <Stack.Screen
                            name="StudentDetail"
                            component={StudentDetailScreen}
                            options={({ navigation }: any) => ({
                                ...detailHeaderOptions,
                                title: 'Alumno',
                                headerTitleStyle: { fontFamily: 'Inter_700Bold', fontSize: 17, color: '#1c1917' },
                                headerRight: () => (
                                    <HomeHeaderButton onPress={() => navigation.navigate('Main', { screen: 'Inicio' })} />
                                ),
                            })}
                        />
                    </>
                ) : (
                    <Stack.Screen name="Login" component={LoginScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
