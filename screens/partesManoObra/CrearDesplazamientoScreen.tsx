// CrearDesplazamientoScreen.tsx
import React, {useState, useLayoutEffect} from 'react'; // Importar useLayoutEffect
import {View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {MainTabParamList} from "../../App"; // Asegúrate de que la ruta a MainTabParamList sea correcta

type CrearDesplazamientoScreenProps = StackScreenProps<MainTabParamList, 'CrearDesplazamiento'>;

export default function CrearDesplazamientoScreen({navigation, route}: CrearDesplazamientoScreenProps) {
    const [matricula, setMatricula] = useState('');
    const [distancia, setDistancia] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const onSave = route.params?.onSave;

    // Configura las opciones de navegación aquí para la modal
    useLayoutEffect(() => {
        navigation.setOptions({
            // Opcional: Si quieres un botón de "Cancelar" explícito en la cabecera
            headerLeft: () => (
                <TouchableOpacity onPress={() => {
                    // Al cancelar, simplemente volvemos atrás sin pasar datos
                    navigation.goBack();
                }} style={styles.cancelButtonHeader}>
                    <Text style={styles.cancelButtonHeaderText}>Cancelar</Text>
                </TouchableOpacity>
            ),
            // Opcional: Si quieres un título diferente en la cabecera
            title: 'Detalles del Desplazamiento',
            // Podrías ocultar la cabecera si el diseño de tu modal no la necesita
            // headerShown: false,
        });
    }, [navigation]);

    const handleSave = () => {
        if (!matricula || !distancia) {
            Alert.alert("Error", "Por favor, complete todos los campos.");
            return;
        }

        const nuevoDesplazamiento = {
            id: Date.now(),
            matricula,
            distancia: parseFloat(distancia),
            fecha,
        };

        // Si la función onSave existe, la llamamos con el nuevo desplazamiento
        if (onSave) {
            onSave(nuevoDesplazamiento);
        }

        // Finalmente, cerramos el modal
        navigation.goBack();
    };

    // El botón de cancelar si no lo pones en la cabecera
    const handleCancel = () => {
        Alert.alert(
            "Descartar Desplazamiento",
            "¿Estás seguro de que quieres descartar este desplazamiento?",
            [
                {text: "Cancelar", style: "cancel"},
                {
                    text: "Descartar",
                    onPress: () => {
                        navigation.goBack(); // Simplemente vuelve atrás
                    },
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
            <TextInput
                style={styles.input}
                value={fecha}
                textContentType={'dateTime'} // Ayuda al teclado a mostrar el formato de fecha
                onChangeText={setFecha}
                placeholder="YYYY-MM-DD"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>

            {/* Botón de cancelar opcional si no usas headerLeft */}
            {/* Si usas headerLeft, puedes quitar este botón para evitar redundancia */}
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // paddingTop: 60, // Puedes ajustar esto si la cabecera está presente
        padding: 20,
        backgroundColor: '#f8f8f8',
        // Si quieres que la modal tenga un fondo redondeado en las esquinas
        // puedes añadir 'borderTopLeftRadius', 'borderTopRightRadius' y usar un modal nativo
        // pero para la transición de React Navigation, esto es suficiente.
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
    cancelButtonHeader: { // Estilos para el botón de cancelar en la cabecera
        marginLeft: 15,
        padding: 10,
    },
    cancelButtonHeaderText: {
        color: '#3EB1A5', // O el color que uses para tus botones de navegación
        fontSize: 16,
    },
    cancelButton: { // Estilos para un botón de cancelar en el cuerpo de la pantalla
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