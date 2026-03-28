import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import api from '../services/api';

import { SaceWebViewSync } from '../components/SaceWebViewSync';

export default function LoginScreen() {
    const [userSace, setUserSace] = useState('');
    const [passwordSace, setPasswordSace] = useState('');
    const [loading, setLoading] = useState(false);
    const [showWebView, setShowWebView] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const { signIn } = useAuth();

    async function handleLogin() {
        if (!userSace || !passwordSace) {
            Alert.alert('Error', 'Por favor ingresa usuario y contraseña');
            return;
        }

        setLoading(true);
        setStatusMessage('Conectando con el servidor...');

        try {
            // Step 1: Try direct API login (no SACE needed if data exists)
            const response = await api.post('/sace/login', {
                username: userSace,
                password: passwordSace,
                cookies: ''
            });

            const data = response.data;

            if (data.success && data.hasData) {
                // Docente exists and has synced data → direct login, no SACE needed
                setStatusMessage('Datos encontrados. Iniciando sesión...');
                await signIn(userSace, passwordSace);
                return;
            }

            // Docente doesn't have data or doesn't exist → need SACE sync
            setStatusMessage('Conectando con SACE...');
            setShowWebView(true);

        } catch (error: any) {
            console.error('Direct login failed, falling back to SACE:', error.message);
            // API not reachable → try SACE directly
            setStatusMessage('Conectando con SACE...');
            setShowWebView(true);
        }
    }

    const handleSaceSuccess = async (cookies: string) => {
        setShowWebView(false);
        setStatusMessage('Sincronizando datos...');
        try {
            await signIn(userSace, passwordSace, cookies);
        } catch (error) {
            Alert.alert('Login Fallido', 'Error de conexión con el banco de datos SACE');
        } finally {
            setLoading(false);
            setStatusMessage('');
        }
    };

    const handleSaceError = (error: string) => {
        setShowWebView(false);
        setLoading(false);
        setStatusMessage('');
        Alert.alert('Error de Inicio', 'SACE no aceptó tus credenciales o el sitio web no respondió. Detalle: ' + error);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
            <StatusBar style="dark" />
            <View className="w-4/5 web:max-w-md web:w-full bg-white p-6 rounded-lg shadow-md">
                <Text className="text-2xl font-bold text-center text-gray-800 mb-6">eProfe Login</Text>

                <Text className="text-gray-600 mb-2">Usuario SACE</Text>
                <TextInput
                    className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 mb-4 text-gray-800"
                    placeholder="Ej: 0801199012345"
                    value={userSace}
                    onChangeText={setUserSace}
                    autoCapitalize="none"
                />

                <Text className="text-gray-600 mb-2">Contraseña SACE</Text>
                <TextInput
                    className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 mb-6 text-gray-800"
                    placeholder="********"
                    value={passwordSace}
                    onChangeText={setPasswordSace}
                    secureTextEntry
                />

                <TouchableOpacity
                    className="w-full bg-blue-600 p-4 rounded-md items-center"
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <View className="items-center">
                            <ActivityIndicator color="#fff" />
                            {statusMessage ? (
                                <Text className="text-white text-xs mt-2">{statusMessage}</Text>
                            ) : null}
                        </View>
                    ) : (
                        <Text className="text-white font-bold text-lg">Ingresar</Text>
                    )}
                </TouchableOpacity>

                {showWebView && (
                    <SaceWebViewSync
                        credentials={{ usuario: userSace, clave: passwordSace }}
                        onSyncSuccess={handleSaceSuccess}
                        onSyncError={handleSaceError}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
