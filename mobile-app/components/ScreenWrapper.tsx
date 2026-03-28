import React from 'react';
import { View, Platform, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenWrapperProps extends ViewProps {
    children: React.ReactNode;
    fullWidth?: boolean; // If true, doesn't constrain width (good for maps or full-width banners)
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, style, className, fullWidth = false, ...props }) => {
    const Container = Platform.OS === 'web' ? View : SafeAreaView;

    return (
        <Container className={`flex-1 bg-white ${className || ''}`} {...props}>
            <View className={`flex-1 w-full ${!fullWidth ? 'web:max-w-4xl web:mx-auto' : ''}`}>
                {children}
            </View>
        </Container>
    );
};
