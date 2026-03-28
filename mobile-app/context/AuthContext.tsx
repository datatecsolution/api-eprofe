import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import { database } from '../model/index';

interface User {
    id: number;
    userSace: string;
    nombre: string;
    apellido: string;
    email: string;
    cookies?: string;
    // Add other fields as needed
}

interface AuthContextData {
    user: User | null;
    loading: boolean;
    signIn: (userSace: string, passwordSace: string, cookies?: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStorageData() {
            try {
                let storedUser: string | null = null;
                if (Platform.OS === 'web') {
                    storedUser = localStorage.getItem('user');
                } else {
                    storedUser = await SecureStore.getItemAsync('user');
                }

                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error("Failed to load user data", e);
            } finally {
                setLoading(false);
            }
        }

        loadStorageData();
    }, []);

    async function signIn(userSace: string, passwordSace: string, cookies?: string) {
        try {
            const response = await api.post('/sace/login', {
                cookies: cookies || '',
                username: userSace,
                password: passwordSace
            });

            if (response.data && response.data.success) {
                const backendDocente = response.data.docente;
                const userData: User = {
                    id: backendDocente?.id ?? 999,
                    userSace: userSace,
                    nombre: backendDocente?.nombre || userSace,
                    apellido: backendDocente?.apellido || '',
                    email: backendDocente?.email || '',
                    cookies: cookies
                };
                setUser(userData);

                // Store user without cookies (cookies can be huge base64 data that exceeds SecureStore limits)
                const { cookies: _cookies, ...userForStorage } = userData;
                if (Platform.OS === 'web') {
                    localStorage.setItem('user', JSON.stringify(userForStorage));
                } else {
                    await SecureStore.setItemAsync('user', JSON.stringify(userForStorage));
                }
            } else {
                throw new Error("Invalid credentials or SACE error");
            }

            // Trigger Initial Sync
        } catch (error) {
            console.error("Login Error", error);
            throw error;
        }
    }

    // ...

    async function signOut() {
        try {
            await database.write(async () => {
                await database.unsafeResetDatabase();
            });
        } catch (error) {
            console.error('Error resetting database', error);
        }
        setUser(null);
        if (Platform.OS === 'web') {
            localStorage.removeItem('user');
        } else {
            await SecureStore.deleteItemAsync('user');
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
