import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import GradesScreen from '../screens/grades/GradesScreen';
import StudentsScreen from '../screens/students/StudentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CustomDrawerContent from './CustomDrawerContent';
import { Home, ClipboardCheck, GraduationCap, Users, UserCircle } from 'lucide-react-native';

const Drawer = createDrawerNavigator();

export default function MainNavigator() {
    return (
        <Drawer.Navigator
            initialRouteName="Inicio"
            screenOptions={{
                headerStyle: { backgroundColor: '#fafaf9' },  // surface-50
                headerTintColor: '#1c1917',                    // surface-900
                headerShadowVisible: false,
                headerTitleStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 18 },
                drawerActiveTintColor: '#16a34a',              // primary-600
                drawerActiveBackgroundColor: '#f0fdf6',        // primary-50
                drawerInactiveTintColor: '#57534e',            // surface-600
                drawerLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 15, marginLeft: -8 },
                drawerItemStyle: { borderRadius: 12, paddingVertical: 2 },
            }}
            drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
            <Drawer.Screen
                name="Inicio"
                component={HomeScreen}
                options={{ drawerIcon: ({ color, size }) => <Home size={size} color={color} /> }}
            />
            <Drawer.Screen
                name="Asistencia"
                component={AttendanceScreen}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => <ClipboardCheck size={size} color={color} />,
                }}
            />
            <Drawer.Screen
                name="Acumulativos"
                component={GradesScreen}
                options={{
                    title: 'Calificaciones',
                    drawerIcon: ({ color, size }) => <GraduationCap size={size} color={color} />,
                }}
            />
            <Drawer.Screen
                name="Alumnos"
                component={StudentsScreen}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => <Users size={size} color={color} />,
                }}
            />
            <Drawer.Screen
                name="Mi Perfil"
                component={ProfileScreen}
                options={{ drawerIcon: ({ color, size }) => <UserCircle size={size} color={color} /> }}
            />
        </Drawer.Navigator>
    );
}
