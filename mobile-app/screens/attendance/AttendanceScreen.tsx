import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import AsignaturaSeccion from '../../model/AsignaturaSeccion';
import { database } from '../../model/index';
import { Card, EmptyState } from '../../components/ui';
import { ClipboardCheck, Clock, ChevronRight, Inbox } from 'lucide-react-native';

const PeriodoLabel = ({ periodoId }: { periodoId: string }) => {
    const [label, setLabel] = useState('');
    useEffect(() => {
        if (!periodoId) return;
        database.get('periodos').find(periodoId).then((p: any) => {
            if (p) setLabel(`${p.fechaInicio} → ${p.fechaFinal}`);
        }).catch(() => {});
    }, [periodoId]);
    if (!label) return null;
    return (
        <Text className="text-xs text-surface-400 mt-1" style={{ fontFamily: 'Inter_400Regular' }}>
            {label}
        </Text>
    );
};

const AttendanceItem = ({ asignacion, seccion, asignatura, onPress, onHistory }: any) => (
    <Card className="mb-3">
        <TouchableOpacity
            className="pb-3"
            onPress={() => onPress(asignacion, asignatura, seccion)}
            activeOpacity={0.7}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-1">
                    <Text
                        className="text-base text-surface-800"
                        style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                        {asignatura?.nombre || 'Sin asignatura'}
                    </Text>
                    <Text
                        className="text-sm text-surface-500 mt-0.5"
                        style={{ fontFamily: 'Inter_400Regular' }}
                    >
                        {seccion?.curso || ''} - {seccion?.seccion || ''} ({seccion?.jornada || ''})
                    </Text>
                    <PeriodoLabel periodoId={seccion?._raw?.periodo_id || seccion?.periodoId} />
                </View>
                <ChevronRight size={20} color="#d6d3d1" />
            </View>
        </TouchableOpacity>

        <View className="flex-row border-t border-surface-100 pt-3 -mx-4 px-4">
            <TouchableOpacity
                className="flex-1 flex-row items-center justify-center py-2 bg-primary-50 rounded-xl mr-1.5"
                onPress={() => onPress(asignacion, asignatura, seccion)}
                activeOpacity={0.7}
            >
                <ClipboardCheck size={16} color="#16a34a" />
                <Text className="text-primary-700 text-sm ml-1.5" style={{ fontFamily: 'Inter_600SemiBold' }}>
                    Pasar lista
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                className="flex-1 flex-row items-center justify-center py-2 bg-surface-50 rounded-xl ml-1.5"
                onPress={() => onHistory(asignacion, asignatura, seccion)}
                activeOpacity={0.7}
            >
                <Clock size={16} color="#78716c" />
                <Text className="text-surface-600 text-sm ml-1.5" style={{ fontFamily: 'Inter_500Medium' }}>
                    Historial
                </Text>
            </TouchableOpacity>
        </View>
    </Card>
);

const EnhancedAttendanceItem = withObservables(['asignacion'], ({ asignacion }) => ({
    asignacion: asignacion,
    seccion: asignacion.seccion,
    asignatura: asignacion.asignatura,
}))(AttendanceItem);


function AttendanceScreen({ asignaciones }: { asignaciones: AsignaturaSeccion[] }) {
    const navigation = useNavigation<any>();

    const handlePress = (asignacion: any, asignatura: any, seccion: any) => {
        navigation.navigate('TakeAttendance', {
            asignaturaSeccionId: asignacion.id,
            nombreClase: asignatura?.nombre || '',
            detalleSeccion: `${seccion?.curso || ''} ${seccion?.seccion || ''}`
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

    if (!asignaciones) {
        return (
            <View className="flex-1 justify-center items-center bg-surface-50">
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-surface-50">
            <View className="px-5 pt-2">
                {asignaciones.length === 0 ? (
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
