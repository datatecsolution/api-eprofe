import React from 'react';
import { View, Text, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import AsignaturaSeccion from '../../model/AsignaturaSeccion';
import { Card, EmptyState } from '../../components/ui';
import { ChevronRight, GraduationCap, Inbox } from 'lucide-react-native';

const GradeClassItem = ({ asignacion, seccion, asignatura, onPress }: any) => (
    <Card className="mb-3" onPress={() => onPress(asignacion, asignatura, seccion)}>
        <View className="flex-row justify-between items-center">
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
            </View>
            <ChevronRight size={20} color="#d6d3d1" />
        </View>
    </Card>
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
        return (
            <View className="flex-1 justify-center items-center bg-surface-50">
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-surface-50">
            <View className="px-5 pt-2 flex-1">
                {asignaciones.length === 0 ? (
                    <EmptyState
                        icon={<Inbox size={32} color="#a8a29e" />}
                        title="Sin clases asignadas"
                        description="Sincroniza tus datos para ver tus clases."
                    />
                ) : (
                    <FlatList
                        data={asignaciones}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <EnhancedGradeClassItem asignacion={item} onPress={handlePress} />
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

export default withDatabase(enhance(GradesScreen) as any);
