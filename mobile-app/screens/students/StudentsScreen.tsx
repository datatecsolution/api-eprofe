import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { Q } from '@nozbe/watermelondb';
import Alumno from '../../model/Alumno';
import { Avatar, Card, EmptyState } from '../../components/ui';
import { Search, ChevronRight, Users } from 'lucide-react-native';

const StudentItem = ({ alumno, seccionLabel, onPress }: { alumno: Alumno; seccionLabel?: string; onPress: () => void }) => (
    <Card className="mb-2" onPress={onPress}>
        <View className="flex-row items-center">
            <Avatar name={`${alumno.nombre} ${alumno.apellido}`} size="sm" />
            <View className="flex-1 ml-3">
                <Text
                    className="text-base text-surface-800"
                    style={{ fontFamily: 'Inter_500Medium' }}
                    numberOfLines={1}
                >
                    {alumno.nombre} {alumno.apellido}
                </Text>
                <Text className="text-xs text-surface-400" style={{ fontFamily: 'Inter_400Regular' }}>
                    {alumno.rne || 'Sin RNE'}{seccionLabel ? ` · ${seccionLabel}` : ''}
                </Text>
            </View>
            <ChevronRight size={18} color="#d6d3d1" />
        </View>
    </Card>
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

    useEffect(() => {
        async function loadAlumnos() {
            setLoading(true);
            try {
                if (selectedSeccion) {
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
                    const allAlumnos = await database.get('alumnos').query().fetch();
                    setAlumnos(allAlumnos as Alumno[]);

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
        <SafeAreaView className="flex-1 bg-surface-50">
            <View className="px-5 pt-2 flex-1">
                {/* Section filter */}
                {secciones.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3 -mx-1">
                        <TouchableOpacity
                            className={`px-4 py-2.5 mx-1 rounded-xl ${!selectedSeccion ? 'bg-primary-600' : 'bg-surface-100'}`}
                            onPress={() => setSelectedSeccion(null)}
                            activeOpacity={0.7}
                        >
                            <Text
                                className={`text-sm ${!selectedSeccion ? 'text-white' : 'text-surface-600'}`}
                                style={{ fontFamily: 'Inter_600SemiBold' }}
                            >
                                Todos
                            </Text>
                        </TouchableOpacity>
                        {secciones.map(s => (
                            <TouchableOpacity
                                key={s.id}
                                className={`px-4 py-2.5 mx-1 rounded-xl ${selectedSeccion === s.id ? 'bg-primary-600' : 'bg-surface-100'}`}
                                onPress={() => setSelectedSeccion(s.id)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    className={`text-sm ${selectedSeccion === s.id ? 'text-white' : 'text-surface-600'}`}
                                    style={{ fontFamily: 'Inter_500Medium' }}
                                >
                                    {s.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* Search */}
                <View className="flex-row items-center bg-white border-2 border-surface-200 rounded-2xl px-4 mb-4">
                    <Search size={18} color="#a8a29e" />
                    <TextInput
                        placeholder="Buscar alumno..."
                        className="flex-1 py-3.5 ml-3 text-base text-surface-800"
                        style={{ fontFamily: 'Inter_400Regular' }}
                        placeholderTextColor="#a8a29e"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#16a34a" />
                    </View>
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
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <EmptyState
                                icon={<Users size={28} color="#a8a29e" />}
                                title="Sin resultados"
                                description="No se encontraron alumnos."
                            />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
