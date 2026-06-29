import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';
import Acumulativo from '../../model/Acumulativo';
import { Card, Badge, Button, EmptyState } from '../../components/ui';
import { Plus, BarChart3, Inbox } from 'lucide-react-native';

const PARCIALES = [
    { value: 1, label: '1er' },
    { value: 2, label: '2do' },
    { value: 3, label: '3er' },
    { value: 4, label: '4to' },
];

const AcumulativoItem = ({ acumulativo, onPress, onLongPress }: { acumulativo: Acumulativo, onPress: () => void, onLongPress: () => void }) => (
    <Card className="mb-2" onPress={onPress}>
        <TouchableOpacity onLongPress={onLongPress} activeOpacity={1}>
            <View className="flex-row justify-between items-center">
                <View className="flex-1">
                    <Text
                        className="text-base text-surface-800"
                        style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                        {acumulativo.descripcion}
                    </Text>
                    <Text
                        className="text-xs text-surface-400 mt-0.5"
                        style={{ fontFamily: 'Inter_400Regular' }}
                    >
                        {acumulativo.fecha}
                    </Text>
                </View>
                <Badge label={`${acumulativo.valor} pts`} variant="info" />
            </View>
        </TouchableOpacity>
    </Card>
);

function ClassGradesScreen({ acumulativos }: { acumulativos: Acumulativo[] }) {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { asignaturaSeccionId, nombreClase, detalleSeccion, asignaturaId, seccionId } = route.params;
    const [selectedParcial, setSelectedParcial] = useState(1);

    const filtered = acumulativos.filter((a: any) => a.parcial === selectedParcial);
    const totalPuntos = filtered.reduce((acc: number, a: any) => acc + (a.valor || 0), 0);
    const disponibles = 100 - totalPuntos;

    const handleCreate = () => {
        navigation.navigate('CreateGrade', { asignaturaSeccionId, asignaturaId, seccionId });
    };

    const handlePress = (acumulativo: Acumulativo) => {
        navigation.navigate('GradeDetail', { acumulativoId: acumulativo.id, descripcion: acumulativo.descripcion });
    };

    const handleEdit = (acumulativo: Acumulativo) => {
        navigation.navigate('CreateGrade', {
            asignaturaSeccionId, asignaturaId, seccionId,
            editAcumulativoId: acumulativo.id,
        });
    };

    const handleLongPress = (acumulativo: Acumulativo) => {
        Alert.alert(acumulativo.descripcion, '', [
            { text: 'Editar', onPress: () => handleEdit(acumulativo) },
            { text: 'Eliminar', style: 'destructive', onPress: () => confirmDelete(acumulativo) },
            { text: 'Cancelar', style: 'cancel' },
        ]);
    };

    const confirmDelete = (acumulativo: Acumulativo) => {
        Alert.alert('Eliminar', `¿Eliminar "${acumulativo.descripcion}" y todas sus notas?`, [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const db = acumulativo.database;
                        await db.write(async () => {
                            const notas = await db.get('notas_acumulativos')
                                .query(Q.where('acumulativo_id', acumulativo.id)).fetch();
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
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-surface-50">
            {/* Header */}
            <View className="bg-white px-5 pt-4 pb-4 border-b border-surface-100">
                <Text className="text-xl text-surface-900" style={{ fontFamily: 'Inter_700Bold' }}>
                    {nombreClase}
                </Text>
                <Text className="text-sm text-surface-400 mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>
                    {detalleSeccion}
                </Text>
            </View>

            <View className="flex-1 px-5 pt-4">
                {/* Parcial tabs */}
                <View className="flex-row mb-4 bg-surface-100 rounded-2xl p-1">
                    {PARCIALES.map((p) => (
                        <TouchableOpacity
                            key={p.value}
                            className={`flex-1 py-2.5 rounded-xl items-center ${selectedParcial === p.value ? 'bg-white shadow-card' : ''}`}
                            onPress={() => setSelectedParcial(p.value)}
                            activeOpacity={0.7}
                        >
                            <Text
                                className={`text-sm ${selectedParcial === p.value ? 'text-surface-800' : 'text-surface-400'}`}
                                style={{ fontFamily: selectedParcial === p.value ? 'Inter_600SemiBold' : 'Inter_500Medium' }}
                            >
                                {p.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Points summary */}
                <View className="flex-row justify-between bg-primary-50 px-4 py-3 rounded-2xl mb-4">
                    <Text className="text-sm text-primary-700" style={{ fontFamily: 'Inter_500Medium' }}>
                        Usados: {totalPuntos}/100
                    </Text>
                    <Text className="text-sm text-primary-700" style={{ fontFamily: 'Inter_700Bold' }}>
                        Disponibles: {disponibles}
                    </Text>
                </View>

                {/* Action buttons */}
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-sm text-surface-400 uppercase tracking-wider" style={{ fontFamily: 'Inter_600SemiBold' }}>
                        Evaluaciones
                    </Text>
                    <View className="flex-row">
                        <TouchableOpacity
                            className="flex-row items-center bg-surface-100 px-3 py-2 rounded-xl mr-2"
                            onPress={() => navigation.navigate('GradeSummary', {
                                asignaturaId, seccionId, nombreClase, detalleSeccion, parcial: selectedParcial
                            })}
                            activeOpacity={0.7}
                        >
                            <BarChart3 size={16} color="#57534e" />
                            <Text className="text-surface-600 text-sm ml-1.5" style={{ fontFamily: 'Inter_600SemiBold' }}>
                                Resumen
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center bg-primary-600 px-3 py-2 rounded-xl"
                            onPress={handleCreate}
                            activeOpacity={0.7}
                        >
                            <Plus size={16} color="#fff" />
                            <Text className="text-white text-sm ml-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
                                Crear
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {filtered.length === 0 ? (
                    <EmptyState
                        icon={<Inbox size={28} color="#a8a29e" />}
                        title="Sin evaluaciones"
                        description="Crea tu primera evaluación para este parcial."
                    />
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
                        showsVerticalScrollIndicator={false}
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
