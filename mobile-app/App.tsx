import "./global.css";
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider'
import { QueryClientProvider } from "@tanstack/react-query";
import { database } from './model/index'
import { queryClient } from "./services/queryClient";
import { AuthProvider } from "./context/AuthContext";
import AppNavigator from "./navigation/AppNavigator";
import Toast from 'react-native-toast-message';

import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-surface-50">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <DatabaseProvider database={database}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppNavigator />
          <StatusBar style="dark" />
          <Toast />
        </AuthProvider>
      </QueryClientProvider>
    </DatabaseProvider>
  );
}
