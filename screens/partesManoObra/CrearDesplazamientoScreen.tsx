// CrearDesplazamientoScreen.tsx
import React, {useState, useLayoutEffect} from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    TouchableOpacity,
    Platform // Importante para detectar el SO
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {MainTabParamList} from "../../App";
// Importación unificada del DatePicker
import RNDateTimePicker, {DateTimePickerEvent} from "@react-native-community/datetimepicker";

type CrearDesplazamientoScreenProps = StackScreenProps<MainTabParamList, 'CrearDesplazamiento'>;

export default function CrearDesplazamientoScreen({navigation, route}: CrearDesplazamientoScreenProps) {
    // Estados
    const [matricula, setMatricula] = useState('');
    const [distancia, setDistancia] = useState('');

    // Estado para el objeto Date (necesario para el componente Picker)
    const [date, setDate] = useState(new Date());
    // Estado para el string que envías al guardar (YYYY-MM-DD)
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

    // Controla si se muestra o no el calendario
    const [showDatePicker, setShowDatePicker] = useState(false);

    const onSave = route.params?.onSave;

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={() => {
                    navigation.goBack();
                }} style={styles.cancelButtonHeader}>
                    <Text style={styles.cancelButtonHeaderText}>Cancelar</Text>
                </TouchableOpacity>
            ),
            title: 'Detalles del Desplazamiento',
        });
    }, [navigation]);

    // --- Lógica del DatePicker ---
    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || date;

        // En Android, el picker se cierra automáticamente.
        // En iOS, a veces queremos mantenerlo abierto o cerrarlo según el estilo.
        // Aquí lo cerramos al seleccionar para simplificar.
        setShowDatePicker(Platform.OS === 'ios');

        setDate(currentDate);
        // Actualizamos el string que se muestra y se guarda
        setFecha(currentDate.toISOString().split('T')[0]);
    };

    const showDatepicker = () => {
        setShowDatePicker(true);
    };
    // -----------------------------

    const handleSave = () => {
        if (!matricula || !distancia) {
            Alert.alert("Error", "Por favor, complete todos los campos.");
            return;
        }

        const nuevoDesplazamiento = {
            id: Date.now(),
            matricula,
            distancia: parseFloat(distancia),
            fecha, // Usamos el string formateado
        };

        if (onSave) {
            onSave(nuevoDesplazamiento);
        }
        navigation.goBack();
    };

    const handleCancel = () => {
        Alert.alert(
            "Descartar Desplazamiento",
            "¿Estás seguro de que quieres descartar este desplazamiento?",
            [
                {text: "Cancelar", style: "cancel"},
                {
                    text: "Descartar",
                    onPress: () => navigation.goBack(),
                    style: "destructive"
                }
            ],
            {cancelable: true}
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Nuevo Desplazamiento</Text>

            <Text style={styles.label}>Matrícula:</Text>
            <TextInput
                style={styles.input}
                value={matricula}
                onChangeText={setMatricula}
                placeholder="Ej: 1234 ABC"
            />

            <Text style={styles.label}>Distancia (km):</Text>
            <TextInput
                style={styles.input}
                value={distancia}
                onChangeText={setDistancia}
                keyboardType="numeric"
                placeholder="Ej: 50"
            />

            <Text style={styles.label}>Fecha:</Text>


            <RNDateTimePicker
                themeVariant={'light'}
                testID="dateTimePicker"
                maximumDate={new Date()}
                value={date}
                mode={'date'}
                is24Hour={true}
                display="spinner"
                onChange={onChangeDate}
            />


            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: 'white', // Añadido para consistencia visual
    },
    // Nuevos estilos para el contenedor de la fecha para que se vea igual que los inputs
    inputDateContainer: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: 'white',
        justifyContent: 'center', // Centra el texto verticalmente
    },
    inputText: {
        fontSize: 14,
        color: 'black',
    },
    saveButton: {
        backgroundColor: '#5bbd6f',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButtonHeader: {
        marginLeft: 15,
        padding: 10,
    },
    cancelButtonHeaderText: {
        color: '#3EB1A5',
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    cancelButtonText: {
        color: '#64748b',
        fontSize: 18,
        fontWeight: 'bold',
    },
});