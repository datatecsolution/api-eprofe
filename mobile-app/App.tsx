import "./global.css";
import { StatusBar } from 'expo-status-bar';
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider'
import { QueryClientProvider } from "@tanstack/react-query";
import { database } from './model/index'
import { queryClient } from "./services/queryClient";
import { AuthProvider } from "./context/AuthContext";
import AppNavigator from "./navigation/AppNavigator";

import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <DatabaseProvider database={database}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppNavigator />
          <StatusBar style="auto" />
          <Toast />
        </AuthProvider>
      </QueryClientProvider>
    </DatabaseProvider>
  );
}

