// CreatePartScreen.tsx
import React, {useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Button,
    Alert,
    TouchableOpacity,
    ScrollView,
    Platform // Para ajustes específicos de plataforma si fueran necesarios
} from 'react-native';
import {Picker} from '@react-native-picker/picker'; // Necesitarás instalar esta librería
import {Ionicons} from '@expo/vector-icons';
import {StackScreenProps} from '@react-navigation/stack';
import {MainTabParamList, RootStackParamList} from '../App'; // Importa tus tipos de parámetros

// Tipo de props para CreatePartScreen
// Ahora CreatePartScreen está dentro de MainTabStack, pero también necesita navegar al RootStack (para el menú)
type CreatePartScreenProps = StackScreenProps<MainTabParamList, 'CrearParte'> & {
    navigation: StackScreenProps<RootStackParamList>['navigation']; // Para acceder al RootStack (para el menú)
};

export default function CreatePartScreen({route, navigation}: CreatePartScreenProps) {
    // Asegúrate de que user y accessToken se reciben correctamente de route.params
    const {user, accessToken} = route.params;

    // Estado para los campos del formulario
    const [nombreObra, setNombreObra] = useState('');
    const [medidaValor, setMedidaValor] = useState(''); // Usamos string para TextInput
    const [medidaUnidad, setMedidaUnidad] = useState('metros'); // Valor inicial del desplegable

    // Log para depuración: verifica si user es undefined aquí
    console.log('CreatePartScreen - Received user:', user);
    console.log('CreatePartScreen - Received accessToken:', accessToken);


    // Función para manejar el envío del formulario
    const handleSubmit = () => {
        // Validación básica
        if (!nombreObra.trim()) {
            Alert.alert("Error de Validación", "Por favor, introduce el nombre de la obra.");
            return;
        }

        if (!medidaValor.trim()) {
            Alert.alert("Error de Validación", "Por favor, introduce el valor de la medida.");
            return;
        }

        const valorNumerico = parseFloat(medidaValor);
        if (isNaN(valorNumerico)) {
            Alert.alert("Error de Validación", "El valor de la medida debe ser numérico.");
            return;
        }

        // Aquí iría la lógica para enviar estos datos a tu API o base de datos
        // Puedes usar `nombreObra`, `valorNumerico`, `medidaUnidad`, `user.id`, `accessToken`
        console.log({
            nombreObra,
            medida: {
                valor: valorNumerico,
                unidad: medidaUnidad,
            },
            creadoPor: user ? user.displayName : 'Desconocido', // Uso defensivo de user
            accessToken: accessToken,
        });

        // Simulación de envío exitoso
        Alert.alert(
            "Parte Creado",
            `Obra: "${nombreObra}"\nMedida: ${valorNumerico} ${medidaUnidad}\nCreado por: ${user ? user.displayName : 'N/A'}`
        );

        // Limpiar el formulario después del envío exitoso
        setNombreObra('');
        setMedidaValor('');
        setMedidaUnidad('metros'); // Restablecer a la unidad por defecto
    };

    // Si el usuario no se cargó correctamente, mostrar un mensaje de error o loading
    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando información del usuario o error...</Text>
                {/* O un indicador de carga real */}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {/* Botón para abrir el Menú, navega a la pantalla 'Menu' en el RootStack */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('Menu', {user, accessToken})}
                    style={styles.menuButton}
                >
                    <Ionicons name="menu" size={30} color="#1e293b"/>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Crear Nuevo Parte</Text>
                    <Text style={styles.headerSubtitle}>Introduce los detalles del nuevo parte de obra</Text>
                </View>
            </View>

            {/* ScrollView para asegurar que el formulario sea desplazable si es largo o el teclado lo cubre */}
            <ScrollView contentContainerStyle={styles.formContainer}>
                {/* Campo: Nombre de Obra */}
                <Text style={styles.label}>Nombre de Obra:</Text>
                <TextInput
                    style={styles.input}
                    value={nombreObra}
                    onChangeText={setNombreObra}
                    placeholder="Ej: Reforma Cocina"
                    placeholderTextColor="#94a3b8"
                />

                {/* Campo: Medida (Valor y Unidad) */}
                <Text style={styles.label}>Medida:</Text>
                <View style={styles.measureInputContainer}>
                    {/* Campo de texto numérico para el valor de la medida */}
                    <TextInput
                        style={styles.measureValueInput}
                        value={medidaValor}
                        onChangeText={setMedidaValor}
                        keyboardType="numeric" // Solo permite entrada numérica
                        placeholder="Ej: 100"
                        placeholderTextColor="#94a3b8"
                    />
                    {/* Desplegable para la unidad de medida */}
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={medidaUnidad}
                            onValueChange={(itemValue: string) => setMedidaUnidad(itemValue)}
                            style={styles.picker}
                            // Opcional: itemStyle para iOS para controlar el estilo del texto en el picker
                            itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
                        >
                            <Picker.Item label="Metros (m)" value="metros"/>
                            <Picker.Item label="Metros Cuadrados (m²)" value="m2"/>
                            <Picker.Item label="Metros Cúbicos (m³)" value="m3"/>
                            <Picker.Item label="Unidades" value="unidades"/>
                            <Picker.Item label="Kilogramos (kg)" value="kg"/> {/* Otro valor */}
                            <Picker.Item label="Litros (L)" value="litros"/> {/* Otro valor */}
                        </Picker>
                    </View>
                </View>

                {/* Botón para enviar el formulario */}
                <Button title="Guardar Parte" onPress={handleSubmit} color="#0078d4"/>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#f8fafc",
    },
    loadingText: {
        fontSize: 18,
        color: '#666',
    },
    header: {
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 20, // Ajuste para iOS por la barra de estado
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuButton: {
        marginRight: 15,
        padding: 5,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1e293b",
    },
    headerSubtitle: {
        fontSize: 16,
        color: "#64748b",
    },
    formContainer: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'white',
        marginBottom: 10,
        color: '#333', // Asegurar que el texto sea visible
    },
    measureInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    measureValueInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'white',
        marginRight: 10,
        color: '#333', // Asegurar que el texto sea visible
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        flex: 1.2, // Ajusta el ancho relativo
        backgroundColor: 'white',
        overflow: 'hidden', // Para que el borde redondeado se vea bien en Android
    },
    picker: {
        height: 50, // Altura estándar para Picker
        width: '100%',
        color: '#333', // Color del texto del Picker
    },
    pickerItem: {
        // Solo para iOS para estilo de texto individual si es necesario
        fontSize: 16,
        color: '#333',
    },
});