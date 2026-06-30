import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import { Q } from '@nozbe/watermelondb';
import Matricula from '../../model/Matricula';
import NotaAcumulativo from '../../model/NotaAcumulativo';
import { Avatar, Button, Badge } from '../../components/ui';
import Toast from 'react-native-toast-message';

const StudentGradeRow = ({ matricula, grade, maxGrade, onChangeGrade }: any) => {
    const [alumno, setAlumno] = useState<any>(null);

    useEffect(() => {
        matricula.alumno.fetch().then(setAlumno);
    }, []);

    if (!alumno) return <View className="h-16" />;

    const fullName = `${alumno.nombre} ${alumno.apellido}`;

    return (
        <View className="flex-row items-center bg-white px-5 py-3 border-b border-surface-100">
            <Avatar name={fullName} size="sm" />
            <View className="flex-1 ml-3">
                <Text
                    className="text-base text-surface-800"
                    style={{ fontFamily: 'Inter_500Medium' }}
                    numberOfLines={1}
                >
                    {fullName}
                </Text>
            </View>
            <TextInput
                className="bg-surface-50 border-2 border-surface-200 rounded-xl w-20 py-2.5 text-center text-lg text-surface-800"
                style={{ fontFamily: 'Inter_700Bold' }}
                value={grade}
                onChangeText={(text) => onChangeGrade(matricula.id, text)}
                keyboardType="numeric"
                maxLength={5}
                placeholderTextColor="#d6d3d1"
                placeholder="—"
            />
        </View>
    );
};

function GradeDetailScreen({ database, route, navigation }: { database: any; route: any; navigation: any }) {
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
                const matriculasData = await database.get('matriculas')
                    .query(Q.where('seccion_id', seccion.id))
                    .fetch();
                setMatriculas(matriculasData);

                const existingGrades = await database.get('notas_acumulativos')
                    .query(Q.where('acumulativo_id', acumulativoId))
                    .fetch();

                const alumnoGradeMap: any = {};
                existingGrades.forEach((n: any) => {
                    alumnoGradeMap[n._raw.alumno_id] = n.nota.toString();
                });

                const uiMap: any = {};
                for (const m of matriculasData as any[]) {
                    const alumnoId = m._raw.alumno_id;
                    uiMap[m.id] = alumnoGradeMap[alumnoId] || '';
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
        setGradesMap(prev => ({ ...prev, [matriculaId]: text }));
    };

    const saveGrades = async () => {
        setLoading(true);
        try {
            await database.write(async () => {
                const notesCollection = database.get('notas_acumulativos');

                for (const m of matriculas) {
                    const gradeStr = gradesMap[m.id];
                    if (!gradeStr) continue;

                    const notaVal = parseFloat(gradeStr);
                    if (isNaN(notaVal) || notaVal < 0) continue;
                    if (notaVal > (acumulativo as any).valor) continue;
                    const alumnoId = (m as any)._raw.alumno_id;

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
            Toast.show({ type: 'success', text1: 'Listo', text2: 'Notas guardadas' });
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron guardar las notas' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-surface-50">
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-surface-50">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                {/* Título "{descripcion} · Ingreso de notas" va en el header nativo.
                    Mantenemos el máximo de puntos a la vista en una barra fina. */}
                <View className="bg-white px-5 py-3 border-b border-surface-100 flex-row items-center justify-end">
                    <Badge label={`Máx ${acumulativo?.valor || 0} pts`} variant="info" />
                </View>

                <FlatList
                    data={matriculas}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <StudentGradeRow
                            matricula={item}
                            grade={gradesMap[item.id]}
                            maxGrade={acumulativo?.valor || 0}
                            onChangeGrade={handleGradeChange}
                        />
                    )}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />

                <View className="absolute bottom-0 w-full px-5 py-4 bg-white border-t border-surface-100">
                    <Button title="Guardar Notas" onPress={saveGrades} size="lg" />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default withDatabase(GradeDetailScreen);
