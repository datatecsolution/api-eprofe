import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Home, Clock } from 'lucide-react-native';

// Helpers para los headers NATIVOS del stack de detalle (Fix 2 de navegación).
// IMPORTANTE: estos componentes se renderizan DENTRO del header nativo de react-native-screens,
// un punto del árbol especial. Por eso usan `style` inline y NO `className` de NativeWind:
// css-interop al evaluar un componente con className en este contexto puede tocar el getter
// del contexto de navegación y lanzar "Couldn't find a navigation context" (mismo bug que en
// el selector de parcial). Inline styles lo evitan por completo.

export function HeaderTitle({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <View style={{ justifyContent: 'center' }}>
            <Text
                numberOfLines={1}
                style={{ fontFamily: 'Inter_700Bold', fontSize: 17, color: '#1c1917' }}
            >
                {title}
            </Text>
            {subtitle ? (
                <Text
                    numberOfLines={1}
                    style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#a8a29e', marginTop: 1 }}
                >
                    {subtitle}
                </Text>
            ) : null}
        </View>
    );
}

function HeaderIconButton({ onPress, bg, children }: { onPress: () => void; bg: string; children: React.ReactNode }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.6}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}
        >
            {children}
        </TouchableOpacity>
    );
}

export function HomeHeaderButton({ onPress }: { onPress: () => void }) {
    return (
        <HeaderIconButton onPress={onPress} bg="#f0fdf6">
            <Home size={19} color="#16a34a" />
        </HeaderIconButton>
    );
}

export function ClockHeaderButton({ onPress }: { onPress: () => void }) {
    return (
        <HeaderIconButton onPress={onPress} bg="#f5f5f4">
            <Clock size={19} color="#57534e" />
        </HeaderIconButton>
    );
}

// Opciones compartidas para las pantallas de detalle: header blanco, flecha de regreso nativa
// neutra, título a la izquierda, sin sombra, fondo de contenido surface-50.
export const detailHeaderOptions = {
    headerShown: true,
    headerStyle: { backgroundColor: '#ffffff' },
    headerShadowVisible: false,
    headerTintColor: '#44403c',
    headerTitleAlign: 'left' as const,
    headerBackButtonDisplayMode: 'minimal' as const,
    contentStyle: { backgroundColor: '#fafaf9' },
};
