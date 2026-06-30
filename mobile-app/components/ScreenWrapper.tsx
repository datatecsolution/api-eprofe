import React from 'react';
import { View, Platform, ViewProps } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

interface ScreenWrapperProps extends ViewProps {
    children: React.ReactNode;
    fullWidth?: boolean; // If true, doesn't constrain width (good for maps or full-width banners)
    // Edges del safe-area a respetar. En pantallas con header nativo del stack hay que excluir
    // 'top' (el header ya consume esa zona) para no dejar un hueco arriba.
    edges?: readonly Edge[];
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, style, className, fullWidth = false, edges, ...props }) => {
    const isWeb = Platform.OS === 'web';
    const Container: any = isWeb ? View : SafeAreaView;
    const containerProps = isWeb ? props : { ...props, edges };

    return (
        <Container className={`flex-1 bg-white ${className || ''}`} {...containerProps}>
            <View className={`flex-1 w-full ${!fullWidth ? 'web:max-w-4xl web:mx-auto' : ''}`}>
                {children}
            </View>
        </Container>
    );
};
