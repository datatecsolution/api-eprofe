import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerActions } from '@react-navigation/native';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { Q } from '@nozbe/watermelondb';
import Alumno from '../../model/Alumno';
import { Avatar, EmptyState } from '../../components/ui';
import { Search, ChevronRight, Users, Menu } from 'lucide-react-native';

const StudentRow = ({ alumno, seccionLabel, onPress }: { alumno: Alumno; seccionLabel?: string; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="flex-row items-center px-4.5 py-3.5 bg-white">
        <Avatar name={`${alumno.nombre} ${alumno.apellido}`} size="sm" />
        <View className="flex-1 mx-3">
            <Text
                className="text-[15px] text-surface-800"
                style={{ fontFamily: 'Inter_500Medium' }}
                numberOfLines={1}
            >
                {alumno.nombre} {alumno.apellido}
            </Text>
            <Text className="text-xs text-surface-400 mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>
                {alumno.rne || 'Sin RNE'}{seccionLabel ? ` · ${seccionLabel}` : ''}
            </Text>
        </View>
        <ChevronRight size={18} color="#d6d3d1" />
    </TouchableOpacity>
);

type SeccionOption = { id: string; label: string };

export default function StudentsScreen({ navigation }: any) {
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

    const q = search.toLowerCase();
    const filteredAlumnos = alumnos.filter(a =>
        (a.nombre ?? '').toLowerCase().includes(q) ||
        (a.apellido ?? '').toLowerCase().includes(q)
    );

    return (
        <SafeAreaView className="flex-1 bg-surface-50">
            <View className="px-6 pt-2 flex-1">
                {/* Header con botón de menú + título */}
                <TouchableOpacity
                    onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                    activeOpacity={0.7}
                    className="w-11 h-11 -ml-2 rounded-xl items-center justify-center mb-2"
                >
                    <Menu size={24} color="#1c1917" />
                </TouchableOpacity>
                <Text className="text-[28px] text-surface-900 mb-5" style={{ fontFamily: 'Inter_700Bold' }}>
                    Alumnos
                </Text>

                {/* Búsqueda */}
                <View className="flex-row items-center bg-white border-[1.5px] border-surface-200 rounded-2xl px-4 mb-4">
                    <Search size={18} color="#a8a29e" />
                    <TextInput
                        placeholder="Buscar alumno…"
                        className="flex-1 py-[13px] ml-3 text-[15px] text-surface-800"
                        style={{ fontFamily: 'Inter_400Regular' }}
                        placeholderTextColor="#a8a29e"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                {/* Chips de sección */}
                {secciones.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 -mx-1 grow-0">
                        {/* className constante + style inline para el estado activo (evita el bug de
                            css-interop al cambiar className dinámico tras el render inicial; ver
                            selector de parcial en ClassGradesScreen). */}
                        <TouchableOpacity
                            className="px-[15px] py-2 mx-1 rounded-xl"
                            style={{ backgroundColor: !selectedSeccion ? '#16a34a' : '#f5f5f4' }}
                            onPress={() => setSelectedSeccion(null)}
                            activeOpacity={0.7}
                        >
                            <Text
                                className="text-[13px]"
                                style={{ color: !selectedSeccion ? '#ffffff' : '#57534e', fontFamily: !selectedSeccion ? 'Inter_600SemiBold' : 'Inter_500Medium' }}
                            >
                                Todos
                            </Text>
                        </TouchableOpacity>
                        {secciones.map(s => {
                            const active = selectedSeccion === s.id;
                            return (
                                <TouchableOpacity
                                    key={s.id}
                                    className="px-[15px] py-2 mx-1 rounded-xl"
                                    style={{ backgroundColor: active ? '#16a34a' : '#f5f5f4' }}
                                    onPress={() => setSelectedSeccion(s.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        className="text-[13px]"
                                        style={{ color: active ? '#ffffff' : '#57534e', fontFamily: active ? 'Inter_600SemiBold' : 'Inter_500Medium' }}
                                    >
                                        {s.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}

                {/* keys distintas por rama: evitan que React reuse el mismo fiber al pasar de
                    "cargando" a "lista" y le cambie el className a uno con shadow-card → eso disparaba
                    el upgrade-warning de css-interop y el crash "navigation context". */}
                {loading ? (
                    <View key="students-loading" className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#16a34a" />
                    </View>
                ) : filteredAlumnos.length === 0 ? (
                    <View key="students-empty" className="flex-1">
                        <EmptyState
                            icon={<Users size={28} color="#a8a29e" />}
                            title="Sin resultados"
                            description="No se encontraron alumnos."
                        />
                    </View>
                ) : (
                    <View key="students-list" className="bg-white rounded-[20px] shadow-card overflow-hidden flex-1 mb-2">
                        <FlatList
                            data={filteredAlumnos}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <StudentRow
                                    alumno={item}
                                    seccionLabel={!selectedSeccion ? alumnoSecciones[item.id] : undefined}
                                    onPress={() => handlePress(item)}
                                />
                            )}
                            ItemSeparatorComponent={() => <View className="h-px bg-surface-100" />}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
