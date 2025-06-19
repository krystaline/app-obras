// CreatePartScreen.tsx
import React, {useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator, TextInput
} from 'react-native';

import {StackScreenProps} from '@react-navigation/stack';
import {MainTabParamList, RootStackParamList} from '../App';
import {apiService, ParteData, Actividad} from '../config/apiService';
import ElementsTable from '../components/ElementsTable'
import SignaturePad from "../components/SignaturePad";

// CreatePartScreen.tsx

type CreatePartScreenProps = StackScreenProps<MainTabParamList, 'CrearParte'> & {
    navigation: StackScreenProps<RootStackParamList>['navigation'];
};

interface ElementRow {
    id: number
    description: string
    quantity: string
    unit: string
    impValue?: string
}

interface CustomSelectItem {
    id: string;
    title: string;
    contact: {
        id: string;
        title: string;
        signature: string;
        phone: number;
    };
    teamManager: {
        id: string;
        name: string;
    };
    createdAt: string;
}

export default function CreatePartScreen({route, navigation}: CreatePartScreenProps) {
    const {user, accessToken} = route.params;

    // Estados para los datos que vienen de ElementsTable
    const [selectedProject, setSelectedProject] = useState<CustomSelectItem | null>(null);
    const [tableElements, setTableElements] = useState<ElementRow[]>([]);
    const [ascensorValue, setAscensorValue] = useState(0);
    const [ascensorValue1, setAscensorValue1] = useState(0);

    // Estados locales
    const [comentarios, setComentarios] = useState('');
    const [loading, setLoading] = useState(false);
    const [fechaParte, setFechaParte] = useState(new Date().toISOString());
    const [signature, setSignature] = useState<string | null>(null);
    const [isScrollingEnabled, setIsScrollingEnabled] = useState(true);
    const [parteId, setParteId] = useState(0);


    // Callbacks para recibir datos de ElementsTable
    const handleProjectSelect = (project: CustomSelectItem | null) => {
        setSelectedProject(project);
    };

    const handleElementsChange = (elements: ElementRow[]) => {
        setTableElements(elements);
    };

    const handleSignatureSaved = (signatureData: string) => {
        setSignature(signatureData);
    };

    const handleDrawingStatusChange = (isDrawing: boolean) => {
        setIsScrollingEnabled(!isDrawing);
    };

    const handleSubmit = async () => {
        // Validaciones
        if (!selectedProject) {
            Alert.alert("Error", "Por favor, selecciona un proyecto.");
            return;
        }

        if (!signature) {
            Alert.alert("Error", "Por favor, añade tu firma.");
            return;
        }

        // Verificar que hay al menos una actividad con cantidad
        const hasActivities = tableElements.some(el =>
            parseFloat(el.quantity) > 0 && el.description.trim() !== ''
        );

        if (!hasActivities) {
            Alert.alert("Error", "Por favor, añade al menos una actividad con cantidad.");
            return;
        }

        //@ts-ignore
        const activitiesToSend: Actividad[] = tableElements.map(el => {
            let activityName = el.description;

            if (el.id === 4) { // Foso Ascensor 1
                activityName = `Foso Ascensor - ${ascensorValue}`;
            } else if (el.id === 5) { // Foso Ascensor 2
                activityName = `Foso Ascensor - ${ascensorValue1}`;
            } else if (el.id === 11 && el.impValue) { // Impermeabilización superficial
                activityName = `Impermeabilización superficial ${el.impValue} Krystaline 1`;
            }

            // Para filas personalizadas (16, 17), si no hay descripción, no enviar
            if ((el.id === 16 || el.id === 17) && !el.description.trim()) {
                return null;
            }

            return {
                id: el.id,
                name: activityName,
                cantidad: parseFloat(el.quantity) || 0,
                unidad: el.unit,
            };
        }).filter(act => act !== null && act.cantidad > 0);

        setLoading(true);

        apiService.getLastPartId(accessToken).then(response => {
            setParteId(response.data)
            console.log("Parte ID: ", parteId)
        })

        try {
            const parteData: ParteData = {

                id: parteId,
                status: "active",
                parteDate: fechaParte,
                teamManager: selectedProject.teamManager,
                actividades: activitiesToSend,
                project: selectedProject,
                signature: signature, // Incluir la firma en los datos
                comments: comentarios
            }


            const response = await apiService.createParte(parteData, accessToken);

            if (response.success) {
                Alert.alert(
                    "Éxito",
                    "Parte creado exitosamente",
                    [
                        {
                            text: "OK",
                            onPress: () => navigation.goBack()
                        }
                    ]
                );
            } else {
                console.error('❌ Error del servidor:', response.error);
                Alert.alert(
                    "Error del Servidor",
                    response.error || response.message || "No se pudo crear el parte",
                    [
                        {
                            text: "Reintentar",
                            onPress: () => handleSubmit()
                        },
                        {
                            text: "OK",
                            style: "cancel"
                        }
                    ]
                );
            }

        } catch (error: any) {
            console.error('🚨 Error inesperado:', error);
            Alert.alert(
                "Error",
                "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
                [
                    {
                        text: "OK",
                        style: "cancel"
                    }
                ]
            );
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0078d4"/>
                <Text style={styles.loadingText}>Cargando información del usuario...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Crear Nuevo Parte</Text>
                    <Text style={styles.headerSubtitle}>Introduce los detalles del parte de obra</Text>
                </View>
            </View>

            <ScrollView scrollEnabled={isScrollingEnabled} contentContainerStyle={styles.formContainer}>

                <ElementsTable
                    user={user}
                    accessToken={accessToken}
                    onProjectSelect={handleProjectSelect}
                    onElementsChange={handleElementsChange}
                    ascensorValue={ascensorValue}
                    setAscensorValue={setAscensorValue}
                    ascensorValue1={ascensorValue1}
                    setAscensorValue1={setAscensorValue1}
                    setFechaParte={setFechaParte}
                />
                <View>
                    <Text style={styles.loadingText}>Comentarios:</Text>
                    <TextInput style={styles.fieldContainer}
                               value={comentarios}
                               onChangeText={setComentarios}
                               multiline={true}/>
                </View>
                {/* Información del usuario */}
                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>Creado por:</Text>
                    <Text style={styles.infoValue}>{user.displayName}</Text>
                </View>

                <View style={styles.fieldContainer}>
                    <SignaturePad
                        onDrawingStatusChange={handleDrawingStatusChange}
                        onSignatureSaved={handleSignatureSaved}
                    />
                </View>

                {/* Resumen de datos (opcional, para debug) */}
                {selectedProject && (
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryTitle}>Resumen:</Text>
                        <Text style={styles.summaryText}>Proyecto: {selectedProject.title}</Text>
                        <Text style={styles.summaryText}>
                            Actividades: {tableElements.filter(el => parseFloat(el.quantity) > 0).length}
                        </Text>
                        <Text style={styles.summaryText}>
                            Firma: {signature ? "✓ Añadida" : "✗ Pendiente"}
                        </Text>
                    </View>
                )}

                {/* Botones */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="white"/>
                        ) : (
                            <Text style={styles.submitButtonText}>Guardar Parte</Text>
                        )}
                    </TouchableOpacity>
                </View>

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
        backgroundColor: "white",
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
    summaryContainer: {
        backgroundColor: '#e6f7ff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#fa2222',
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#090909',
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 14,
        color: '#424242',
        marginBottom: 4,
    },
    header: {
        padding: 20,
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
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1e293b",
    },
    headerSubtitle: {
        fontSize: 16,
        color: "#64748b",
        marginTop: 4,
    },
    formContainer: {
        padding: 10,
        paddingBottom: 40,
    },
    fieldContainer: {
        marginBottom: 20,
    },

    infoContainer: {
        backgroundColor: '#f1f5f9',
        padding: 15,
        borderRadius: 8,
        marginBottom: 30,
        borderLeftWidth: 4,
        borderLeftColor: '#3EB1A5',
    },
    infoLabel: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    button: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cancelButtonText: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#3EB1A5',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        backgroundColor: '#94a3b8',
    },
});