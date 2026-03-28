import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { Q } from '@nozbe/watermelondb';
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
    const [originalValor, setOriginalValor] = useState(0); // To exclude current acumulativo from sum when editing
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    // Load tipos and existing acumulativo if editing
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

    // Recalculate used points when parcial changes
    useEffect(() => {
        async function calcUsados() {
            try {
                const existentes = await database.get('acumulativos').query(
                    Q.where('asignatura_id', asignaturaId),
                    Q.where('seccion_id', seccionId),
                    Q.where('parcial', parcial)
                ).fetch();
                const suma = existentes.reduce((acc: number, a: any) => acc + (a.valor || 0), 0);
                // When editing, exclude the current acumulativo's original valor
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
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        const valorNum = parseFloat(valor);
        if (isNaN(valorNum) || valorNum <= 0) {
            Alert.alert('Error', 'El valor debe ser un número positivo');
            return;
        }

        if (valorNum > puntosDisponibles) {
            Alert.alert(
                'Excede el límite',
                `Solo quedan ${puntosDisponibles} puntos disponibles en el ${PARCIALES[parcial - 1].label}.\nYa usados: ${puntosUsados} de 100.`
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
                Toast.show({ type: 'success', text1: 'Éxito', text2: 'Evaluación actualizada' });
            } else {
                await database.write(async () => {
                    await database.get('acumulativos').create((record: any) => {
                        // Set raw relation IDs first
                        record._raw.asignatura_id = asignaturaId;
                        record._raw.seccion_id = seccionId;
                        if (tipoAcumulativoId) {
                            record._raw.tipo_acumulativo_id = tipoAcumulativoId;
                        }
                        // Then set decorated fields
                        record._raw.descripcion = nombre;
                        record._raw.valor = valorNum;
                        record._raw.parcial = parcial;
                        record._raw.fecha = new Date().toISOString().split('T')[0];
                        record._raw.uploaded = false;
                    });
                });
                Toast.show({ type: 'success', text1: 'Éxito', text2: 'Evaluación creada' });
            }

            navigation.goBack();
        } catch (error: any) {
            console.error('Save acumulativo error:', error?.message || error, { asignaturaId, seccionId, nombre, valor: valorNum, parcial });
            Toast.show({ type: 'error', text1: 'Error', text2: error?.message || 'No se pudo guardar el acumulativo' });
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></View>;
    }

    return (
        <ScreenWrapper className="bg-white">
            <ScrollView className="flex-1 p-4">
                <Text className="text-xl font-bold mb-6 text-center">
                    {isEditing ? 'Editar Evaluación' : 'Crear Evaluación'}
                </Text>

                <View className="web:max-w-2xl web:mx-auto w-full">
                    {/* Parcial selector */}
                    <Text className="text-gray-600 mb-2 font-medium">Parcial</Text>
                    <View className="flex-row mb-4">
                        {PARCIALES.map((p) => (
                            <TouchableOpacity
                                key={p.value}
                                className={`flex-1 p-3 mr-1 rounded-lg items-center ${parcial === p.value ? 'bg-blue-600' : 'bg-gray-100'}`}
                                onPress={() => setParcial(p.value)}
                            >
                                <Text className={`font-bold text-sm ${parcial === p.value ? 'text-white' : 'text-gray-600'}`}>
                                    {p.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Points indicator */}
                    <View className="bg-blue-50 p-3 rounded-lg mb-4 flex-row justify-between">
                        <Text className="text-blue-700 font-medium">Puntos usados: {puntosUsados}/100</Text>
                        <Text className="text-blue-700 font-bold">Disponibles: {puntosDisponibles}</Text>
                    </View>

                    {/* Tipo acumulativo selector */}
                    {tipos.length > 0 && (
                        <View className="mb-4">
                            <Text className="text-gray-600 mb-2 font-medium">Tipo (opcional)</Text>
                            <View className="flex-row flex-wrap">
                                <TouchableOpacity
                                    className={`px-3 py-2 mr-2 mb-2 rounded-full ${!tipoAcumulativoId ? 'bg-gray-600' : 'bg-gray-200'}`}
                                    onPress={() => setTipoAcumulativoId(null)}
                                >
                                    <Text className={`text-sm ${!tipoAcumulativoId ? 'text-white' : 'text-gray-600'}`}>Ninguno</Text>
                                </TouchableOpacity>
                                {tipos.map((t: any) => (
                                    <TouchableOpacity
                                        key={t.id}
                                        className={`px-3 py-2 mr-2 mb-2 rounded-full ${tipoAcumulativoId === t.id ? 'bg-blue-600' : 'bg-gray-200'}`}
                                        onPress={() => setTipoAcumulativoId(t.id)}
                                    >
                                        <Text className={`text-sm ${tipoAcumulativoId === t.id ? 'text-white' : 'text-gray-600'}`}>
                                            {t.descripcion}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Nombre */}
                    <View className="mb-4">
                        <Text className="text-gray-600 mb-1 font-medium">Nombre</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-lg w-full"
                            value={nombre}
                            onChangeText={setNombre}
                            placeholder="Ej: Examen 1, Tarea 2..."
                        />
                    </View>

                    {/* Valor */}
                    <View className="mb-6">
                        <Text className="text-gray-600 mb-1 font-medium">Valor (%)</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-lg w-full"
                            value={valor}
                            onChangeText={setValor}
                            placeholder={`Máximo ${puntosDisponibles}`}
                            keyboardType="numeric"
                        />
                    </View>

                    <TouchableOpacity
                        className={`bg-blue-600 p-4 rounded-lg items-center ${loading ? 'opacity-50' : ''}`}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : (
                            <Text className="text-white font-bold text-lg">
                                {isEditing ? 'Actualizar' : 'Guardar'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
