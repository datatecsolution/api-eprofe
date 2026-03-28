import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';
import Acumulativo from '../../model/Acumulativo';

const PARCIALES = [
    { value: 1, label: '1er' },
    { value: 2, label: '2do' },
    { value: 3, label: '3er' },
    { value: 4, label: '4to' },
];

const AcumulativoItem = ({ acumulativo, onPress, onLongPress }: { acumulativo: Acumulativo, onPress: () => void, onLongPress: () => void }) => (
    <TouchableOpacity
        className="bg-white p-4 mb-2 rounded-lg border border-gray-100 flex-row justify-between items-center"
        onPress={onPress}
        onLongPress={onLongPress}
    >
        <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800">{acumulativo.descripcion}</Text>
            <Text className="text-gray-500 text-xs">{acumulativo.fecha}</Text>
        </View>
        <View className="bg-blue-100 px-3 py-1 rounded-full">
            <Text className="text-blue-700 font-bold">{acumulativo.valor} pts</Text>
        </View>
    </TouchableOpacity>
);

function ClassGradesScreen({ acumulativos }: { acumulativos: Acumulativo[] }) {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { asignaturaSeccionId, nombreClase, detalleSeccion, asignaturaId, seccionId } = route.params;
    const [selectedParcial, setSelectedParcial] = useState(1);

    const filtered = acumulativos.filter((a: any) => a.parcial === selectedParcial);
    const totalPuntos = filtered.reduce((acc: number, a: any) => acc + (a.valor || 0), 0);

    const handleCreate = () => {
        navigation.navigate('CreateGrade', { asignaturaSeccionId, asignaturaId, seccionId });
    };

    const handlePress = (acumulativo: Acumulativo) => {
        navigation.navigate('GradeDetail', { acumulativoId: acumulativo.id, descripcion: acumulativo.descripcion });
    };

    const handleEdit = (acumulativo: Acumulativo) => {
        navigation.navigate('CreateGrade', {
            asignaturaSeccionId,
            asignaturaId,
            seccionId,
            editAcumulativoId: acumulativo.id,
        });
    };

    const handleLongPress = (acumulativo: Acumulativo) => {
        Alert.alert(
            acumulativo.descripcion,
            'Seleccione una acción',
            [
                {
                    text: 'Editar',
                    onPress: () => handleEdit(acumulativo),
                },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => confirmDelete(acumulativo),
                },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    const confirmDelete = (acumulativo: Acumulativo) => {
        Alert.alert(
            'Confirmar eliminación',
            `¿Eliminar "${acumulativo.descripcion}" y todas sus notas?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const db = acumulativo.database;
                            await db.write(async () => {
                                // Delete associated notes first
                                const notas = await db.get('notas_acumulativos')
                                    .query(Q.where('acumulativo_id', acumulativo.id))
                                    .fetch();
                                const batch = notas.map((n: any) => n.prepareDestroyPermanently());
                                batch.push(acumulativo.prepareDestroyPermanently());
                                await db.batch(...batch);
                            });
                        } catch (e) {
                            console.error(e);
                            Alert.alert('Error', 'No se pudo eliminar');
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-blue-600 p-4 pt-4 pb-6">
                <Text className="text-white text-xl font-bold">{nombreClase}</Text>
                <Text className="text-blue-100">{detalleSeccion}</Text>
            </View>

            <View className="flex-1 p-4 -mt-4">
                {/* Parcial tabs */}
                <View className="flex-row mb-3">
                    {PARCIALES.map((p) => (
                        <TouchableOpacity
                            key={p.value}
                            className={`flex-1 py-2 mr-1 rounded-lg items-center ${selectedParcial === p.value ? 'bg-blue-600' : 'bg-white border border-gray-200'}`}
                            onPress={() => setSelectedParcial(p.value)}
                        >
                            <Text className={`font-bold text-sm ${selectedParcial === p.value ? 'text-white' : 'text-gray-600'}`}>
                                {p.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Points summary */}
                <View className="bg-blue-50 p-2 rounded-lg mb-3 flex-row justify-between px-3">
                    <Text className="text-blue-700 text-sm">Total: {totalPuntos}/100 pts</Text>
                    <Text className="text-blue-700 text-sm font-bold">Disponibles: {100 - totalPuntos}</Text>
                </View>

                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-lg font-bold text-gray-800">Evaluaciones</Text>
                    <View className="flex-row">
                        <TouchableOpacity
                            className="bg-gray-200 px-3 py-2 rounded-lg mr-2"
                            onPress={() => navigation.navigate('GradeSummary', {
                                asignaturaId, seccionId, nombreClase, detalleSeccion, parcial: selectedParcial
                            })}
                        >
                            <Text className="text-gray-700 font-bold text-sm">Resumen</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-blue-600 px-4 py-2 rounded-lg"
                            onPress={handleCreate}
                        >
                            <Text className="text-white font-bold">+ Crear</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {filtered.length === 0 ? (
                    <View className="items-center justify-center p-8">
                        <Text className="text-gray-400">No hay evaluaciones en este parcial.</Text>
                        <Text className="text-gray-300 text-xs mt-1">Mantén presionado para eliminar</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filtered}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <AcumulativoItem
                                acumulativo={item}
                                onPress={() => handlePress(item)}
                                onLongPress={() => handleLongPress(item)}
                            />
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const enhance = withObservables(['route'], ({ database, route }: { database: any, route: any }) => {
    const params = route?.params || {};
    const asignaturaId = params.asignaturaId || '';
    const seccionId = params.seccionId || '';
    return {
        acumulativos: database.get('acumulativos').query(
            Q.where('asignatura_id', asignaturaId),
            Q.where('seccion_id', seccionId)
        ).observe()
    };
});

export default withDatabase(enhance(ClassGradesScreen) as any);
