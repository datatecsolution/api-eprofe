import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerActions } from '@react-navigation/native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';
import AsignaturaSeccion from '../../model/AsignaturaSeccion';
import { EmptyState } from '../../components/ui';
import { ChevronRight, Inbox, Menu } from 'lucide-react-native';

const todayStr = () => new Date().toISOString().split('T')[0];

// Tarjeta de clase — la tarjeta entera abre Pasar lista; long-press abre Historial.
const AttendanceItem = ({ asignacion, seccion, asignatura, todayAsistencias, onPress, onHistory }: any) => {
    const tomada = (todayAsistencias?.length || 0) > 0;
    const detalle = [seccion?.curso, seccion?.seccion, seccion?.jornada].filter(Boolean).join(' · ');
    return (
        <TouchableOpacity
            onPress={() => onPress(asignacion, asignatura, seccion)}
            onLongPress={() => onHistory(asignacion, asignatura, seccion)}
            activeOpacity={0.7}
            className="bg-white rounded-[20px] shadow-card p-4.5 mb-3"
        >
            <View className="flex-row items-center">
                <View className="flex-1">
                    <Text className="text-base text-surface-900" style={{ fontFamily: 'Inter_600SemiBold' }}>
                        {asignatura?.nombre || 'Sin asignatura'}
                    </Text>
                    <Text className="text-[13px] text-surface-600 mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>
                        {detalle}
                    </Text>
                    {/* Indicador de estado de hoy (consulta real, read-only) */}
                    <View className="flex-row items-center mt-[11px]">
                        <View className={`w-[7px] h-[7px] rounded-full mr-2 ${tomada ? 'bg-primary-600' : 'bg-amber-500'}`} />
                        <Text
                            className={`text-xs ${tomada ? 'text-primary-600' : 'text-amber-700'}`}
                            style={{ fontFamily: 'Inter_500Medium' }}
                        >
                            {tomada ? 'Lista tomada · hoy' : 'Pendiente de hoy'}
                        </Text>
                    </View>
                </View>
                <ChevronRight size={20} color="#d6d3d1" />
            </View>
        </TouchableOpacity>
    );
};

const EnhancedAttendanceItem = withObservables(['asignacion'], ({ asignacion, database }: any) => ({
    asignacion,
    seccion: asignacion.seccion,
    asignatura: asignacion.asignatura,
    todayAsistencias: database.get('asistencias').query(
        Q.where('asignatura_id', asignacion._raw.asignatura_id),
        Q.where('seccion_id', asignacion._raw.seccion_id),
        Q.where('fecha', todayStr()),
    ).observe(),
}))(AttendanceItem);

function AttendanceScreen({ asignaciones, database, navigation }: { asignaciones: AsignaturaSeccion[]; database: any; navigation: any }) {
    const handlePress = (asignacion: any, asignatura: any, seccion: any) => {
        navigation.navigate('TakeAttendance', {
            asignaturaSeccionId: asignacion.id,
            nombreClase: asignatura?.nombre || '',
            detalleSeccion: `${seccion?.curso || ''} ${seccion?.seccion || ''}`,
        });
    };

    const handleHistory = (asignacion: any, asignatura: any, seccion: any) => {
        navigation.navigate('AttendanceHistory', {
            asignaturaSeccionId: asignacion.id,
            nombreClase: asignatura?.nombre || '',
            detalleSeccion: `${seccion?.curso || ''} ${seccion?.seccion || ''}`,
            asignaturaId: asignatura?.id || asignacion._raw?.asignatura_id || '',
            seccionId: seccion?.id || asignacion._raw?.seccion_id || '',
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-surface-50">
            <View className="flex-1 px-6 pt-2">
                {/* Header con botón de menú + título */}
                <TouchableOpacity
                    onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                    activeOpacity={0.7}
                    className="w-11 h-11 -ml-2 rounded-xl items-center justify-center mb-2"
                >
                    <Menu size={24} color="#1c1917" />
                </TouchableOpacity>
                <View className="mb-6">
                    <Text className="text-[28px] text-surface-900" style={{ fontFamily: 'Inter_700Bold' }}>
                        Asistencia
                    </Text>
                    <Text className="text-sm text-surface-400 mt-1" style={{ fontFamily: 'Inter_400Regular' }}>
                        Elige una clase para pasar lista
                    </Text>
                </View>

                {!asignaciones ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#16a34a" />
                    </View>
                ) : asignaciones.length === 0 ? (
                    <EmptyState
                        icon={<Inbox size={32} color="#a8a29e" />}
                        title="Sin clases asignadas"
                        description="Sincroniza tus datos desde el menú para ver tus clases."
                    />
                ) : (
                    <FlatList
                        data={asignaciones}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <EnhancedAttendanceItem
                                asignacion={item}
                                database={database}
                                onPress={handlePress}
                                onHistory={handleHistory}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const enhance = withObservables([], ({ database }: { database: any }) => ({
    asignaciones: database.get('asignaturas_secciones').query().observe(),
}));

export default withDatabase(enhance(AttendanceScreen) as any);
