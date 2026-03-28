import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import AsignaturaSeccion from '../../model/AsignaturaSeccion';
import { database } from '../../model/index';

const PeriodoLabel = ({ periodoId }: { periodoId: string }) => {
    const [label, setLabel] = useState('');
    useEffect(() => {
        if (!periodoId) return;
        database.get('periodos').find(periodoId).then((p: any) => {
            if (p) setLabel(`${p.fechaInicio} → ${p.fechaFinal}`);
        }).catch(() => {});
    }, [periodoId]);
    if (!label) return null;
    return <Text className="text-gray-400 text-xs mt-1">Periodo: {label}</Text>;
};

const AttendanceItem = ({ asignacion, seccion, asignatura, onPress, onHistory }: any) => (
    <View className="bg-white mb-3 rounded-lg shadow-sm border border-gray-100">
        <TouchableOpacity
            className="p-4"
            onPress={() => onPress(asignacion, asignatura, seccion)}
        >
            <Text className="text-lg font-bold text-gray-800">{asignatura?.nombre || 'Sin asignatura'}</Text>
            <Text className="text-gray-600">
                {seccion?.curso || ''} - {seccion?.seccion || ''} ({seccion?.jornada || ''})
            </Text>
            <PeriodoLabel periodoId={seccion?._raw?.periodo_id || seccion?.periodoId} />
        </TouchableOpacity>
        <View className="flex-row border-t border-gray-100">
            <TouchableOpacity
                className="flex-1 py-3 items-center"
                onPress={() => onPress(asignacion, asignatura, seccion)}
            >
                <Text className="text-blue-600 font-medium text-sm">Tomar Asistencia</Text>
            </TouchableOpacity>
            <View className="w-px bg-gray-100" />
            <TouchableOpacity
                className="flex-1 py-3 items-center"
                onPress={() => onHistory(asignacion, asignatura, seccion)}
            >
                <Text className="text-gray-500 font-medium text-sm">Historial</Text>
            </TouchableOpacity>
        </View>
    </View>
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
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator />
            </View>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 p-4">
            <Text className="text-2xl font-bold text-gray-800 mb-4 ml-2">Mis Clases</Text>
            {asignaciones.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-500 text-lg">No hay clases asignadas.</Text>
                    <Text className="text-gray-400 text-sm mt-2">Intenta sincronizar nuevamente.</Text>
                </View>
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
                />
            )}
        </SafeAreaView>
    );
}

const enhance = withObservables([], ({ database }: { database: any }) => ({
    asignaciones: database.get('asignaturas_secciones').query().observe(),
}));

export default withDatabase(enhance(AttendanceScreen) as any);
