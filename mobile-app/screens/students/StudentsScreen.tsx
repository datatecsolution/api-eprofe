import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { Q } from '@nozbe/watermelondb';
import Alumno from '../../model/Alumno';

const StudentItem = ({ alumno, seccionLabel, onPress }: { alumno: Alumno; seccionLabel?: string; onPress: () => void }) => (
    <TouchableOpacity
        className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-100 flex-row items-center"
        onPress={onPress}
    >
        <View className="h-10 w-10 bg-blue-100 rounded-full items-center justify-center mr-3">
            <Text className="text-blue-600 font-bold text-lg">{alumno.nombre.charAt(0)}</Text>
        </View>
        <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800">{alumno.nombre} {alumno.apellido}</Text>
            <Text className="text-gray-500 text-xs">{alumno.rne || 'No RNE'}{seccionLabel ? ` · ${seccionLabel}` : ''}</Text>
        </View>
    </TouchableOpacity>
);

type SeccionOption = { id: string; label: string };

export default function StudentsScreen() {
    const navigation = useNavigation<any>();
    const database = useDatabase();
    const [search, setSearch] = useState('');
    const [secciones, setSecciones] = useState<SeccionOption[]>([]);
    const [selectedSeccion, setSelectedSeccion] = useState<string | null>(null);
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [alumnoSecciones, setAlumnoSecciones] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    // Load secciones
    useEffect(() => {
        async function loadSecciones() {
            const seccionRecords = await database.get('secciones').query().fetch();
            const options: SeccionOption[] = seccionRecords.map((s: any) => ({
                id: s.id,
                label: `${s.curso} - ${s.seccion} (${s.jornada})`,
            }));
            setSecciones(options);
        }
        loadSecciones();
    }, []);

    // Load alumnos based on selected section
    useEffect(() => {
        async function loadAlumnos() {
            setLoading(true);
            try {
                if (selectedSeccion) {
                    // Get matriculas for this section, then fetch alumnos
                    const matriculas = await database.get('matriculas').query(
                        Q.where('seccion_id', selectedSeccion)
                    ).fetch();
                    const alumnoIds = matriculas.map((m: any) => m._raw.alumno_id);
                    if (alumnoIds.length > 0) {
                        const alumnoRecords = await database.get('alumnos').query(
                            Q.where('id', Q.oneOf(alumnoIds))
                        ).fetch();
                        setAlumnos(alumnoRecords as Alumno[]);
                    } else {
                        setAlumnos([]);
                    }
                    setAlumnoSecciones({});
                } else {
                    // All alumnos
                    const allAlumnos = await database.get('alumnos').query().fetch();
                    setAlumnos(allAlumnos as Alumno[]);

                    // Build alumno -> seccion label map
                    const matriculas = await database.get('matriculas').query().fetch();
                    const seccionMap: Record<string, string> = {};
                    for (const s of secciones) {
                        seccionMap[s.id] = s.label;
                    }
                    const alumnoSecMap: Record<string, string> = {};
                    for (const m of matriculas as any[]) {
                        alumnoSecMap[m._raw.alumno_id] = seccionMap[m._raw.seccion_id] || '';
                    }
                    setAlumnoSecciones(alumnoSecMap);
                }
            } catch (e) {
                console.error('Error loading alumnos:', e);
            } finally {
                setLoading(false);
            }
        }
        loadAlumnos();
    }, [selectedSeccion, secciones]);

    const handlePress = (alumno: Alumno) => {
        navigation.navigate('StudentDetail', { alumnoId: alumno.id });
    };

    const filteredAlumnos = alumnos.filter(a =>
        a.nombre.toLowerCase().includes(search.toLowerCase()) ||
        a.apellido.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 p-4">
            <Text className="text-2xl font-bold text-gray-800 mb-3 ml-2">Alumnos</Text>

            {/* Section filter */}
            {secciones.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                    <TouchableOpacity
                        className={`px-4 py-2 mr-2 rounded-full ${!selectedSeccion ? 'bg-blue-600' : 'bg-gray-200'}`}
                        onPress={() => setSelectedSeccion(null)}
                    >
                        <Text className={`text-sm font-bold ${!selectedSeccion ? 'text-white' : 'text-gray-600'}`}>Todos</Text>
                    </TouchableOpacity>
                    {secciones.map(s => (
                        <TouchableOpacity
                            key={s.id}
                            className={`px-4 py-2 mr-2 rounded-full ${selectedSeccion === s.id ? 'bg-blue-600' : 'bg-gray-200'}`}
                            onPress={() => setSelectedSeccion(s.id)}
                        >
                            <Text className={`text-sm font-bold ${selectedSeccion === s.id ? 'text-white' : 'text-gray-600'}`}>{s.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            <View className="bg-white p-3 rounded-lg border border-gray-200 mb-4 flex-row items-center">
                <TextInput
                    placeholder="Buscar alumno..."
                    className="flex-1 text-lg"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {loading ? (
                <ActivityIndicator className="mt-10" />
            ) : (
                <FlatList
                    data={filteredAlumnos}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <StudentItem
                            alumno={item}
                            seccionLabel={!selectedSeccion ? alumnoSecciones[item.id] : undefined}
                            onPress={() => handlePress(item)}
                        />
                    )}
                    ListEmptyComponent={
                        <Text className="text-center text-gray-400 mt-10">No se encontraron alumnos.</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}
