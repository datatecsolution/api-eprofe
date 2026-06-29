import React, { useState } from 'react';
import { View, Text, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import api from '../services/api';
import { Button, Input } from '../components/ui';
import { User, Lock } from 'lucide-react-native';
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
            Alert.alert('Campos requeridos', 'Por favor ingresa tu usuario y tu contraseña');
            return;
        }

        setLoading(true);
        setStatusMessage('Conectando...');

        try {
            const response = await api.post('/sace/login', {
                username: userSace,
                password: passwordSace,
                cookies: ''
            });

            const data = response.data;

            if (data.success && data.hasData) {
                setStatusMessage('Entrando...');
                await signIn(userSace, passwordSace);
                return;
            }

            setStatusMessage('Conectando con SACE...');
            setShowWebView(true);

        } catch (error: any) {
            console.error('Direct login failed, falling back to SACE:', error.message);
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
            Alert.alert('No se pudo ingresar', 'Hubo un error al conectar con SACE. Intenta de nuevo.');
        } finally {
            setLoading(false);
            setStatusMessage('');
        }
    };

    const handleSaceError = (error: string) => {
        setShowWebView(false);
        setLoading(false);
        setStatusMessage('');
        Alert.alert(
            'No se pudo conectar',
            'Verifica que tu usuario y contraseña sean correctos.'
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-surface-50">
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 justify-center px-6"
            >
                {/* Logo / Brand */}
                <View className="items-center mb-10">
                    <View className="bg-primary-600 h-18 w-18 rounded-3xl items-center justify-center mb-4 shadow-button">
                        <Text className="text-3xl text-white" style={{ fontFamily: 'Inter_700Bold' }}>e</Text>
                    </View>
                    <Text className="text-3xl text-surface-900" style={{ fontFamily: 'Inter_700Bold' }}>
                        eProfe
                    </Text>
                    <Text className="text-base text-surface-400 mt-1" style={{ fontFamily: 'Inter_400Regular' }}>
                        Tu asistente de clases
                    </Text>
                </View>

                {/* Form */}
                <View className="web:max-w-md web:w-full web:mx-auto">
                    <Input
                        label="Usuario SACE"
                        placeholder="Ej: 0801199012345"
                        value={userSace}
                        onChangeText={setUserSace}
                        autoCapitalize="none"
                        icon={<User size={20} color="#a8a29e" />}
                    />

                    <Input
                        label="Contraseña"
                        placeholder="Tu contraseña de SACE"
                        value={passwordSace}
                        onChangeText={setPasswordSace}
                        secureTextEntry
                        icon={<Lock size={20} color="#a8a29e" />}
                    />

                    <View className="mt-2">
                        <Button
                            title={loading ? statusMessage : 'Ingresar'}
                            onPress={handleLogin}
                            loading={loading}
                            size="lg"
                        />
                    </View>

                    {loading && statusMessage && (
                        <Text
                            className="text-sm text-surface-400 text-center mt-4"
                            style={{ fontFamily: 'Inter_400Regular' }}
                        >
                            {statusMessage}
                        </Text>
                    )}
                </View>

                {showWebView && (
                    <SaceWebViewSync
                        credentials={{ usuario: userSace, clave: passwordSace }}
                        onSyncSuccess={handleSaceSuccess}
                        onSyncError={handleSaceError}
                    />
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
