import React from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import AsignaturaSeccion from '../../model/AsignaturaSeccion';

const GradeClassItem = ({ asignacion, seccion, asignatura, onPress }: any) => (
    <TouchableOpacity
        className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-100"
        onPress={() => onPress(asignacion, asignatura, seccion)}
    >
        <View className="flex-row justify-between items-center">
            <View>
                <Text className="text-lg font-bold text-gray-800">{asignatura?.nombre || 'Sin asignatura'}</Text>
                <Text className="text-gray-600">
                    {seccion?.curso || ''} - {seccion?.seccion || ''} ({seccion?.jornada || ''})
                </Text>
            </View>
            <Text className="text-blue-600 font-medium">Ver Notas</Text>
        </View>
    </TouchableOpacity>
);

const EnhancedGradeClassItem = withObservables(['asignacion'], ({ asignacion }) => ({
    asignacion: asignacion,
    seccion: asignacion.seccion,
    asignatura: asignacion.asignatura
}))(GradeClassItem);

function GradesScreen({ asignaciones }: { asignaciones: AsignaturaSeccion[] }) {
    const navigation = useNavigation<any>();

    const handlePress = (asignacion: any, asignatura: any, seccion: any) => {
        navigation.navigate('ClassGrades', {
            asignaturaSeccionId: asignacion.id,
            nombreClase: asignatura?.nombre || '',
            detalleSeccion: `${seccion?.curso || ''} ${seccion?.seccion || ''}`,
            asignaturaId: asignatura?.id || asignacion._raw?.asignatura_id || '',
            seccionId: seccion?.id || asignacion._raw?.seccion_id || ''
        });
    };

    if (!asignaciones) {
        return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></View>
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 p-4">
            <Text className="text-2xl font-bold text-gray-800 mb-4 ml-2">Acumulativos</Text>
            <Text className="text-gray-500 mb-4 ml-2">Seleccione una clase para gestionar notas</Text>

            {asignaciones.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-400 text-lg">No hay clases asignadas</Text>
                    <Text className="text-gray-400 text-sm mt-1">Sincronice datos desde el menu lateral</Text>
                </View>
            ) : null}

            <FlatList
                data={asignaciones}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <EnhancedGradeClassItem
                        asignacion={item}
                        onPress={handlePress}
                    />
                )}
            />
        </SafeAreaView>
    );
}

const enhance = withObservables([], ({ database }: { database: any }) => ({
    asignaciones: database.get('asignaturas_secciones').query().observe(),
}));

export default withDatabase(enhance(GradesScreen) as any);
