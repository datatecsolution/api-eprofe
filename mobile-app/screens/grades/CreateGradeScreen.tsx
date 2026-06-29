import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { Q } from '@nozbe/watermelondb';
import { Button } from '../../components/ui';
import Toast from 'react-native-toast-message';

const PARCIALES = [
    { value: 1, label: '1er Parcial' },
    { value: 2, label: '2do Parcial' },
    { value: 3, label: '3er Parcial' },
    { value: 4, label: '4to Parcial' },
];

export default function CreateGradeScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const database = useDatabase();
    const { asignaturaId, seccionId, editAcumulativoId } = route.params;

    const isEditing = !!editAcumulativoId;

    const [nombre, setNombre] = useState('');
    const [valor, setValor] = useState('');
    const [parcial, setParcial] = useState(1);
    const [tipoAcumulativoId, setTipoAcumulativoId] = useState<string | null>(null);
    const [tipos, setTipos] = useState<any[]>([]);
    const [puntosUsados, setPuntosUsados] = useState(0);
    const [originalValor, setOriginalValor] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const tiposData = await database.get('tipo_acumulativos').query().fetch();
                setTipos(tiposData as any[]);

                if (isEditing) {
                    const acum = await database.get('acumulativos').find(editAcumulativoId);
                    const a = acum as any;
                    setNombre(a.descripcion);
                    setValor(a.valor.toString());
                    setParcial(a.parcial || 1);
                    setOriginalValor(a.valor || 0);
                    if (a._raw.tipo_acumulativo_id) {
                        setTipoAcumulativoId(a._raw.tipo_acumulativo_id);
                    }
                }
            } catch (e) {
                console.error('Error loading data:', e);
            } finally {
                setLoadingData(false);
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        async function calcUsados() {
            try {
                const existentes = await database.get('acumulativos').query(
                    Q.where('asignatura_id', asignaturaId),
                    Q.where('seccion_id', seccionId),
                    Q.where('parcial', parcial)
                ).fetch();
                const suma = existentes.reduce((acc: number, a: any) => acc + (a.valor || 0), 0);
                const adjustment = isEditing ? originalValor : 0;
                setPuntosUsados(suma - adjustment);
            } catch (e) {
                setPuntosUsados(0);
            }
        }
        if (!loadingData) calcUsados();
    }, [parcial, asignaturaId, seccionId, loadingData]);

    const puntosDisponibles = 100 - puntosUsados;

    const handleSave = async () => {
        if (!nombre || !valor) {
            Alert.alert('Campos requeridos', 'Ingresa el nombre y el valor de la evaluación.');
            return;
        }

        const valorNum = parseFloat(valor);
        if (isNaN(valorNum) || valorNum <= 0) {
            Alert.alert('Valor inválido', 'El valor debe ser un número mayor a 0.');
            return;
        }

        if (valorNum > puntosDisponibles) {
            Alert.alert(
                'Puntos insuficientes',
                `Solo quedan ${puntosDisponibles} puntos disponibles en el ${PARCIALES[parcial - 1].label}.`
            );
            return;
        }

        setLoading(true);
        try {
            if (isEditing) {
                const acum = await database.get('acumulativos').find(editAcumulativoId);
                await database.write(async () => {
                    await acum.update((record: any) => {
                        record._raw.descripcion = nombre;
                        record._raw.valor = valorNum;
                        record._raw.parcial = parcial;
                        if (tipoAcumulativoId) {
                            record._raw.tipo_acumulativo_id = tipoAcumulativoId;
                        }
                        record._raw.uploaded = false;
                    });
                });
                Toast.show({ type: 'success', text1: 'Listo', text2: 'Evaluación actualizada' });
            } else {
                await database.write(async () => {
                    await database.get('acumulativos').create((record: any) => {
                        record._raw.asignatura_id = asignaturaId;
                        record._raw.seccion_id = seccionId;
                        if (tipoAcumulativoId) {
                            record._raw.tipo_acumulativo_id = tipoAcumulativoId;
                        }
                        record._raw.descripcion = nombre;
                        record._raw.valor = valorNum;
                        record._raw.parcial = parcial;
                        record._raw.fecha = new Date().toISOString().split('T')[0];
                        record._raw.uploaded = false;
                    });
                });
                Toast.show({ type: 'success', text1: 'Listo', text2: 'Evaluación creada' });
            }
            navigation.goBack();
        } catch (error: any) {
            console.error('Save acumulativo error:', error?.message || error);
            Toast.show({ type: 'error', text1: 'Error', text2: error?.message || 'No se pudo guardar' });
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <View className="flex-1 justify-center items-center bg-surface-50">
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );
    }

    return (
        <ScreenWrapper className="bg-surface-50">
            <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
                <Text
                    className="text-2xl text-surface-900 mb-6"
                    style={{ fontFamily: 'Inter_700Bold' }}
                >
                    {isEditing ? 'Editar Evaluación' : 'Nueva Evaluación'}
                </Text>

                <View className="web:max-w-2xl web:mx-auto w-full">
                    {/* Parcial selector */}
                    <Text className="text-sm text-surface-600 mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
                        Parcial
                    </Text>
                    <View className="flex-row mb-5 bg-surface-100 rounded-2xl p-1">
                        {PARCIALES.map((p) => (
                            <TouchableOpacity
                                key={p.value}
                                className={`flex-1 py-3 rounded-xl items-center ${parcial === p.value ? 'bg-white shadow-card' : ''}`}
                                onPress={() => setParcial(p.value)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    className={`text-sm ${parcial === p.value ? 'text-surface-800' : 'text-surface-400'}`}
                                    style={{ fontFamily: parcial === p.value ? 'Inter_600SemiBold' : 'Inter_500Medium' }}
                                >
                                    {p.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Points indicator */}
                    <View className="flex-row justify-between bg-primary-50 px-4 py-3 rounded-2xl mb-5">
                        <Text className="text-sm text-primary-700" style={{ fontFamily: 'Inter_500Medium' }}>
                            Usados: {puntosUsados}/100
                        </Text>
                        <Text className="text-sm text-primary-700" style={{ fontFamily: 'Inter_700Bold' }}>
                            Disponibles: {puntosDisponibles}
                        </Text>
                    </View>

                    {/* Tipo acumulativo selector */}
                    {tipos.length > 0 && (
                        <View className="mb-5">
                            <Text className="text-sm text-surface-600 mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
                                Tipo (opcional)
                            </Text>
                            <View className="flex-row flex-wrap">
                                <TouchableOpacity
                                    className={`px-4 py-2.5 mr-2 mb-2 rounded-xl ${!tipoAcumulativoId ? 'bg-surface-800' : 'bg-surface-100'}`}
                                    onPress={() => setTipoAcumulativoId(null)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        className={`text-sm ${!tipoAcumulativoId ? 'text-white' : 'text-surface-600'}`}
                                        style={{ fontFamily: 'Inter_500Medium' }}
                                    >
                                        Ninguno
                                    </Text>
                                </TouchableOpacity>
                                {tipos.map((t: any) => (
                                    <TouchableOpacity
                                        key={t.id}
                                        className={`px-4 py-2.5 mr-2 mb-2 rounded-xl ${tipoAcumulativoId === t.id ? 'bg-primary-600' : 'bg-surface-100'}`}
                                        onPress={() => setTipoAcumulativoId(t.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            className={`text-sm ${tipoAcumulativoId === t.id ? 'text-white' : 'text-surface-600'}`}
                                            style={{ fontFamily: 'Inter_500Medium' }}
                                        >
                                            {t.descripcion}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Nombre */}
                    <View className="mb-4">
                        <Text className="text-sm text-surface-600 mb-1.5" style={{ fontFamily: 'Inter_500Medium' }}>
                            Nombre
                        </Text>
                        <TextInput
                            className="bg-surface-50 border-2 border-surface-200 rounded-2xl px-4 py-4 text-base text-surface-800"
                            style={{ fontFamily: 'Inter_400Regular' }}
                            value={nombre}
                            onChangeText={setNombre}
                            placeholder="Ej: Examen 1, Tarea 2..."
                            placeholderTextColor="#a8a29e"
                        />
                    </View>

                    {/* Valor */}
                    <View className="mb-8">
                        <Text className="text-sm text-surface-600 mb-1.5" style={{ fontFamily: 'Inter_500Medium' }}>
                            Valor (%)
                        </Text>
                        <TextInput
                            className="bg-surface-50 border-2 border-surface-200 rounded-2xl px-4 py-4 text-base text-surface-800"
                            style={{ fontFamily: 'Inter_400Regular' }}
                            value={valor}
                            onChangeText={setValor}
                            placeholder={`Máximo ${puntosDisponibles}`}
                            placeholderTextColor="#a8a29e"
                            keyboardType="numeric"
                        />
                    </View>

                    <Button
                        title={isEditing ? 'Actualizar' : 'Guardar'}
                        onPress={handleSave}
                        loading={loading}
                        size="lg"
                    />
                    <View className="h-8" />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
