import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import { Q } from '@nozbe/watermelondb';
import Matricula from '../../model/Matricula';
import NotaAcumulativo from '../../model/NotaAcumulativo';
import Toast from 'react-native-toast-message';

const StudentGradeRow = ({ matricula, grade, maxDate, onChangeGrade }: any) => {
    const [alumno, setAlumno] = useState<any>(null);

    useEffect(() => {
        matricula.alumno.fetch().then(setAlumno);
    }, []);

    if (!alumno) return <View className="h-12" />;

    return (
        <View className="flex-row items-center justify-between bg-white p-3 mb-2 border-b border-gray-100">
            <View className="flex-1">
                <Text className="text-base text-gray-800 font-medium">{alumno.nombre} {alumno.apellido}</Text>
                <Text className="text-gray-500 text-xs">{alumno.rne || 'No RNE'}</Text>
            </View>
            <TextInput
                className="border border-gray-300 rounded w-20 p-2 text-center text-lg font-bold"
                value={grade}
                onChangeText={(text) => onChangeGrade(matricula.id, text)}
                keyboardType="numeric"
                maxLength={5}
            />
        </View>
    );
};

function GradeDetailScreen({ database }: { database: any }) {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { acumulativoId, descripcion } = route.params;

    const [loading, setLoading] = useState(true);
    const [matriculas, setMatriculas] = useState<Matricula[]>([]);
    const [gradesMap, setGradesMap] = useState<Record<string, string>>({});
    const [acumulativo, setAcumulativo] = useState<any>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const acumRecord = await database.get('acumulativos').find(acumulativoId);
                setAcumulativo(acumRecord);

                const seccion = await acumRecord.seccion.fetch();

                // Fetch Students (Matriculas)
                const matriculasData = await database.get('matriculas')
                    .query(Q.where('seccion_id', seccion.id))
                    .fetch();

                setMatriculas(matriculasData);

                // Fetch Existing Grades
                const existingGrades = await database.get('notas_acumulativos')
                    .query(Q.where('acumulativo_id', acumulativoId))
                    .fetch();

                const initialMap: any = {};
                // Pre-fill with existing grades
                existingGrades.forEach((nota: NotaAcumulativo) => {
                    // Need to find which matricula this matches. Nota has alumno_id.
                    // Matricula also has alumno_id.
                    // Mapping logic:
                    // We need a map of alumno_id -> grade, BUT UI renders by matricula.
                    // Let's store by alumnoId for easier lookup, or map matricula to alumnoId
                });

                // Better strategy: Map alumnoId -> Grade
                const alumnoGradeMap: any = {};
                existingGrades.forEach((n: any) => {
                    alumnoGradeMap[n._raw.alumno_id] = n.nota.toString();
                });

                // Now map to matricula ID for the UI state
                const uiMap: any = {};
                for (const m of matriculasData as any[]) {
                    const alumnoId = m._raw.alumno_id;
                    if (alumnoGradeMap[alumnoId]) {
                        uiMap[m.id] = alumnoGradeMap[alumnoId];
                    } else {
                        uiMap[m.id] = '';
                    }
                }
                setGradesMap(uiMap);

            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'No se pudieron cargar los datos');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [acumulativoId]);

    const handleGradeChange = (matriculaId: string, text: string) => {
        // Validate number
        setGradesMap(prev => ({ ...prev, [matriculaId]: text }));
    };

    const saveGrades = async () => {
        setLoading(true);
        try {
            await database.write(async () => {
                const notesCollection = database.get('notas_acumulativos');

                // For each matricula, upsert grade
                for (const m of matriculas) {
                    const gradeStr = gradesMap[m.id];
                    if (!gradeStr) continue;

                    const notaVal = parseFloat(gradeStr);
                    if (isNaN(notaVal) || notaVal < 0) continue;
                    if (notaVal > (acumulativo as any).valor) continue;
                    const alumnoId = (m as any)._raw.alumno_id;

                    // Check if exists (Naive approach: Query inside loop - slow but safe for now)
                    // Better: Load all again or filter from previous `existingGrades`
                    const existing = await notesCollection.query(
                        Q.where('acumulativo_id', acumulativoId),
                        Q.where('alumno_id', alumnoId)
                    ).fetch();

                    if (existing.length > 0) {
                        await existing[0].update((rec: any) => {
                            rec.nota = notaVal;
                            rec.uploaded = false;
                        });
                    } else {
                        await notesCollection.create((rec: any) => {
                            rec._raw.acumulativo_id = acumulativoId;
                            rec._raw.alumno_id = alumnoId;
                            rec.nota = notaVal;
                            rec.uploaded = false;
                        });
                    }
                }
            });
            Toast.show({ type: 'success', text1: 'Éxito', text2: 'Notas guardadas' });
            navigation.goBack();

        } catch (error) {
            console.error(error);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Falló al guardar notas' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></View>;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="bg-blue-600 p-4 pt-10">
                    <Text className="text-white text-xl font-bold">{descripcion}</Text>
                    <Text className="text-blue-100">Ingreso de Notas — Máximo: {acumulativo?.valor || 0} pts</Text>
                </View>

                <FlatList
                    data={matriculas}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <StudentGradeRow
                            matricula={item}
                            grade={gradesMap[item.id]}
                            onChangeGrade={handleGradeChange}
                        />
                    )}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />

                <View className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-200">
                    <TouchableOpacity
                        className="bg-blue-600 p-4 rounded-lg items-center"
                        onPress={saveGrades}
                    >
                        <Text className="text-white font-bold text-lg">Guardar Notas</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default withDatabase(GradeDetailScreen);
