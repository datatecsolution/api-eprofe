import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    retries: number;
}

// Número de auto-reintentos antes de mostrar la pantalla de error manual.
const MAX_AUTO_RETRIES = 3;

// Red de seguridad para errores de render. Muchos son transitorios (p.ej. un re-render
// desacoplado del NavigationContainer durante el sync) y se curan en el siguiente render:
// el boundary los auto-reintenta en silencio. Si el error persiste tras varios intentos,
// muestra una pantalla recuperable con "Reintentar".
export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false, retries: 0 };
    private retryTimer: ReturnType<typeof setTimeout> | null = null;
    private stableTimer: ReturnType<typeof setTimeout> | null = null;

    static getDerivedStateFromError(): Partial<State> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('ErrorBoundary capturó un error:', error?.message || error, info?.componentStack);
        // Auto-reintento silencioso para errores transitorios.
        if (this.state.retries < MAX_AUTO_RETRIES) {
            if (this.retryTimer) clearTimeout(this.retryTimer);
            this.retryTimer = setTimeout(() => {
                this.setState(s => ({ hasError: false, retries: s.retries + 1 }));
            }, 120);
        }
    }

    componentDidUpdate(_prevProps: Props, prevState: State) {
        // Si nos recuperamos y el árbol se mantiene estable un rato, reseteamos el contador
        // para que un futuro error transitorio vuelva a tener sus reintentos.
        if (prevState.hasError && !this.state.hasError && this.state.retries > 0) {
            if (this.stableTimer) clearTimeout(this.stableTimer);
            this.stableTimer = setTimeout(() => {
                this.setState(s => (s.hasError ? s : { ...s, retries: 0 }));
            }, 5000);
        }
    }

    componentWillUnmount() {
        if (this.retryTimer) clearTimeout(this.retryTimer);
        if (this.stableTimer) clearTimeout(this.stableTimer);
    }

    handleManualRetry = () => {
        this.setState({ hasError: false, retries: 0 });
    };

    render() {
        if (this.state.hasError) {
            // Mientras quedan auto-reintentos, mostramos algo neutro (no la pantalla de error).
            if (this.state.retries < MAX_AUTO_RETRIES) {
                return (
                    <View className="flex-1 justify-center items-center bg-surface-50">
                        <ActivityIndicator size="large" color="#16a34a" />
                    </View>
                );
            }

            // Error persistente: pantalla recuperable.
            return (
                <View className="flex-1 justify-center items-center bg-surface-50 px-8">
                    <View className="bg-amber-100 h-16 w-16 rounded-[20px] items-center justify-center mb-5">
                        <AlertTriangle size={28} color="#b45309" />
                    </View>
                    <Text
                        className="text-xl text-surface-900 text-center"
                        style={{ fontFamily: 'Inter_700Bold' }}
                    >
                        Algo salió mal
                    </Text>
                    <Text
                        className="text-sm text-surface-500 text-center mt-2 mb-7"
                        style={{ fontFamily: 'Inter_400Regular' }}
                    >
                        Ocurrió un error inesperado. Puedes reintentar para volver a la app.
                    </Text>
                    <TouchableOpacity
                        onPress={this.handleManualRetry}
                        activeOpacity={0.85}
                        className="flex-row items-center bg-primary-600 rounded-2xl px-6 py-3.5 shadow-button"
                    >
                        <RefreshCw size={18} color="#fff" />
                        <Text
                            className="text-white text-base ml-2"
                            style={{ fontFamily: 'Inter_600SemiBold' }}
                        >
                            Reintentar
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
