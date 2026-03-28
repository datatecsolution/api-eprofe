import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import GradesScreen from '../screens/grades/GradesScreen';
import StudentsScreen from '../screens/students/StudentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CustomDrawerContent from './CustomDrawerContent';

const Drawer = createDrawerNavigator();

export default function MainNavigator() {
    return (
        <Drawer.Navigator
            initialRouteName="Inicio"
            screenOptions={{
                headerStyle: { backgroundColor: '#2563eb' }, // blue-600
                headerTintColor: '#fff',
                drawerActiveTintColor: '#2563eb',
            }}
            drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
            <Drawer.Screen name="Inicio" component={HomeScreen} />
            <Drawer.Screen name="Asistencia" component={AttendanceScreen} />
            <Drawer.Screen name="Acumulativos" component={GradesScreen} />
            <Drawer.Screen name="Alumnos" component={StudentsScreen} />
            <Drawer.Screen name="Mi Perfil" component={ProfileScreen} />
        </Drawer.Navigator>
    );
}
