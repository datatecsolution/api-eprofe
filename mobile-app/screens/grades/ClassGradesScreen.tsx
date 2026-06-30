import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';
import Acumulativo from '../../model/Acumulativo';
import { Badge, EmptyState } from '../../components/ui';
import { Plus, Inbox } from 'lucide-react-native';

const PARCIALES = [
    { value: 1, label: '1er' },
    { value: 2, label: '2do' },
    { value: 3, label: '3er' },
    { value: 4, label: '4to' },
];

const AcumulativoRow = ({ acumulativo, isLast, onPress, onLongPress }: { acumulativo: Acumulativo; isLast: boolean; onPress: () => void; onLongPress: () => void }) => (
    <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
        className={`flex-row items-center py-3.5 ${isLast ? '' : 'border-b border-surface-100'}`}
    >
        <View className="flex-1 pr-3">
            <Text className="text-[15px] text-surface-900" style={{ fontFamily: 'Inter_600SemiBold' }}>
                {acumulativo.descripcion}
            </Text>
            <Text className="text-xs text-surface-400 mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>
                {acumulativo.fecha}
            </Text>
        </View>
        <Badge label={`${acumulativo.valor} pts`} variant="info" />
    </TouchableOpacity>
);

function ClassGradesScreen({ acumulativos }: { acumulativos: Acumulativo[] }) {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { asignaturaSeccionId, nombreClase, detalleSeccion, asignaturaId, seccionId } = route.params;
    const [selectedParcial, setSelectedParcial] = useState(1);

    const filtered = acumulativos.filter((a: any) => a.parcial === selectedParcial);
    const totalPuntos = filtered.reduce((acc: number, a: any) => acc + (a.valor || 0), 0);
    const disponibles = 100 - totalPuntos;
    const pct = Math.min(100, Math.max(0, totalPuntos));

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
            <View className="bg-white px-6 pt-12 pb-4 border-b border-surface-100">
                <Text className="text-xl text-surface-900" style={{ fontFamily: 'Inter_700Bold' }}>
                    {nombreClase}
                </Text>
                <Text className="text-sm text-surface-400 mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>
                    {detalleSeccion}
                </Text>
            </View>

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 110 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Selector de parcial */}
                <View className="flex-row bg-[#f0efed] rounded-2xl p-1 mb-5">
                    {PARCIALES.map((p) => {
                        const active = selectedParcial === p.value;
                        return (
                            <TouchableOpacity
                                key={p.value}
                                className={`flex-1 py-2.5 rounded-xl items-center ${active ? 'bg-white shadow-card' : ''}`}
                                onPress={() => setSelectedParcial(p.value)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    className={`text-sm ${active ? 'text-surface-900' : 'text-surface-400'}`}
                                    style={{ fontFamily: active ? 'Inter_600SemiBold' : 'Inter_500Medium' }}
                                >
                                    {p.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Tarjeta de puntos con barra de progreso */}
                <View className="bg-white rounded-[20px] shadow-card p-4.5 mb-5">
                    <View className="flex-row justify-between items-baseline">
                        <Text className="text-sm text-surface-600" style={{ fontFamily: 'Inter_500Medium' }}>
                            Puntos asignados
                        </Text>
                        <Text className="text-[22px] text-surface-900" style={{ fontFamily: 'Inter_700Bold' }}>
                            {totalPuntos}
                            <Text className="text-sm text-surface-400" style={{ fontFamily: 'Inter_500Medium' }}> /100</Text>
                        </Text>
                    </View>
                    <View className="h-2 bg-[#f0efed] rounded-full mt-3 overflow-hidden">
                        <View className="h-2 bg-primary-600 rounded-full" style={{ width: `${pct}%` }} />
                    </View>
                    <Text className="text-xs text-surface-400 mt-2" style={{ fontFamily: 'Inter_400Regular' }}>
                        {disponibles} puntos disponibles este parcial
                    </Text>
                </View>

                {/* Etiqueta + link a Resumen */}
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-xs text-surface-400 uppercase tracking-wider" style={{ fontFamily: 'Inter_600SemiBold' }}>
                        Evaluaciones
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('GradeSummary', {
                            asignaturaId, seccionId, nombreClase, detalleSeccion, parcial: selectedParcial
                        })}
                        activeOpacity={0.7}
                    >
                        <Text className="text-[13px] text-primary-600" style={{ fontFamily: 'Inter_600SemiBold' }}>
                            Ver resumen
                        </Text>
                    </TouchableOpacity>
                </View>

                {filtered.length === 0 ? (
                    <EmptyState
                        icon={<Inbox size={28} color="#a8a29e" />}
                        title="Sin evaluaciones"
                        description="Crea tu primera evaluación para este parcial."
                    />
                ) : (
                    <View className="bg-white rounded-[20px] shadow-card px-4.5">
                        {filtered.map((item, i) => (
                            <AcumulativoRow
                                key={item.id}
                                acumulativo={item}
                                isLast={i === filtered.length - 1}
                                onPress={() => handlePress(item)}
                                onLongPress={() => handleLongPress(item)}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* FAB Crear */}
            <TouchableOpacity
                onPress={handleCreate}
                activeOpacity={0.85}
                className="absolute right-6 bottom-9 w-14 h-14 rounded-[18px] bg-primary-600 shadow-button items-center justify-center"
            >
                <Plus size={26} color="#fff" />
            </TouchableOpacity>
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
