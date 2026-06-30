import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import AsignaturaSeccion from '../model/AsignaturaSeccion';
import { Avatar, EmptyState } from '../components/ui';
import { ClipboardCheck, GraduationCap, Users, ChevronRight, Inbox } from 'lucide-react-native';

// Fila de "clase de hoy" — observa sus relaciones (mismo patrón que AttendanceScreen)
const ClassRow = ({ asignacion, seccion, asignatura, isLast, onPress }: any) => (
    <TouchableOpacity
        onPress={() => onPress(asignacion, asignatura, seccion)}
        activeOpacity={0.7}
        className={`flex-row items-center py-4 ${isLast ? '' : 'border-b border-surface-100'}`}
    >
        {/* Columna de hora — placeholder hasta que el modelo tenga horario */}
        <Text
            className="text-primary-600 text-sm w-[54px]"
            style={{ fontFamily: 'Inter_700Bold' }}
        >
            —
        </Text>
        <View className="flex-1">
            <Text
                className="text-[15px] text-surface-900"
                style={{ fontFamily: 'Inter_600SemiBold' }}
            >
                {asignatura?.nombre || 'Sin asignatura'}
            </Text>
            <Text
                className="text-[13px] text-surface-400 mt-0.5"
                style={{ fontFamily: 'Inter_400Regular' }}
            >
                {[seccion?.curso, seccion?.seccion, seccion?.jornada].filter(Boolean).join(' · ')}
            </Text>
        </View>
        <ChevronRight size={18} color="#d6d3d1" />
    </TouchableOpacity>
);

const EnhancedClassRow = withObservables(['asignacion'], ({ asignacion }: any) => ({
    asignacion,
    seccion: asignacion.seccion,
    asignatura: asignacion.asignatura,
}))(ClassRow);

// Tile compacto de acceso rápido
const AccessTile = ({ icon, label, onPress }: any) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="flex-1 bg-white rounded-[18px] shadow-card items-center px-2.5 py-4.5"
    >
        <View className="bg-primary-50 h-12 w-12 rounded-[15px] items-center justify-center mb-2">
            {icon}
        </View>
        <Text
            className="text-[13px] text-surface-700"
            style={{ fontFamily: 'Inter_600SemiBold' }}
        >
            {label}
        </Text>
    </TouchableOpacity>
);

function HomeScreen({ asignaciones, navigation }: { asignaciones: AsignaturaSeccion[]; navigation: any }) {
    const { user } = useAuth();
    const fullName = `${user?.nombre || ''} ${user?.apellido || ''}`.trim();

    const handleClassPress = (asignacion: any, asignatura: any, seccion: any) => {
        navigation.navigate('TakeAttendance', {
            asignaturaSeccionId: asignacion.id,
            nombreClase: asignatura?.nombre || '',
            detalleSeccion: `${seccion?.curso || ''} ${seccion?.seccion || ''}`,
        });
    };

    return (
        <ScreenWrapper className="bg-surface-50">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 44 }}
            >
                {/* Header saludo */}
                <View className="flex-row items-center justify-between mb-7">
                    <View className="flex-1 mr-4">
                        <Text
                            className="text-sm text-surface-400"
                            style={{ fontFamily: 'Inter_400Regular' }}
                        >
                            Buenos días,
                        </Text>
                        <Text
                            className="text-[25px] leading-8 text-surface-900"
                            style={{ fontFamily: 'Inter_700Bold' }}
                            numberOfLines={1}
                        >
                            {fullName}
                        </Text>
                    </View>
                    <Avatar name={fullName} size="lg" />
                </View>

                {/* Clases de hoy */}
                <Text
                    className="text-xs text-surface-400 uppercase tracking-wider mb-3"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                    Clases de hoy
                </Text>
                {!asignaciones ? (
                    <ActivityIndicator color="#16a34a" className="my-6" />
                ) : asignaciones.length === 0 ? (
                    <EmptyState
                        icon={<Inbox size={32} color="#a8a29e" />}
                        title="Sin clases asignadas"
                        description="Sincroniza tus datos desde el menú para ver tus clases."
                    />
                ) : (
                    <View className="bg-white rounded-[20px] shadow-card px-4.5">
                        {asignaciones.map((item, i) => (
                            <EnhancedClassRow
                                key={item.id}
                                asignacion={item}
                                isLast={i === asignaciones.length - 1}
                                onPress={handleClassPress}
                            />
                        ))}
                    </View>
                )}

                {/* Accesos */}
                <Text
                    className="text-xs text-surface-400 uppercase tracking-wider mb-3 mt-7"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                    Accesos
                </Text>
                <View className="flex-row" style={{ gap: 12 }}>
                    <AccessTile
                        icon={<ClipboardCheck size={22} color="#16a34a" />}
                        label="Asistencia"
                        onPress={() => navigation.navigate('Asistencia')}
                    />
                    <AccessTile
                        icon={<GraduationCap size={22} color="#16a34a" />}
                        label="Calificaciones"
                        onPress={() => navigation.navigate('Acumulativos')}
                    />
                    <AccessTile
                        icon={<Users size={22} color="#16a34a" />}
                        label="Alumnos"
                        onPress={() => navigation.navigate('Alumnos')}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const enhance = withObservables([], ({ database }: { database: any }) => ({
    asignaciones: database.get('asignaturas_secciones').query().observe(),
}));

export default withDatabase(enhance(HomeScreen) as any);
