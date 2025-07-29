// src/screens/ParteDetailScreen.tsx
import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Linking,
    FlatList
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {MainTabParamList} from '../App';
import {apiService} from '../config/apiService';
import {LineaPartePDF, ParteResponsePDF, Worker, WorkerParte} from "../config/types";
import {Ionicons} from "@expo/vector-icons";

type ParteDetailScreenProps = StackScreenProps<MainTabParamList, 'ParteDetail'>;

export default function ParteDetail({route, navigation}: ParteDetailScreenProps) {
    const {parteId, user, accessToken} = route.params;
    const [parteDetails, setParteDetails] = useState<ParteResponsePDF | null>(null);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState("");

    const [workers, setWorkers] = useState<WorkerParte[]>([]);


    useEffect(() => {
        const fetchParteDetails = async () => {
            setLoading(true);
            const response = await apiService.getPartePdf(parteId, accessToken);
            if (response.success && response.data) {
                console.log(response.data);
                setParteDetails(response.data);
            } else {
                Alert.alert("Error", response.error || "No se pudieron cargar los detalles del parte.");
            }
            setLoading(false);
        };

        const fetchWorkersParte = async () => {
            setLoading(true)
            const res = await apiService.getWorkersParte(accessToken, parteId);
            if (res.success && res.data) {
                setWorkers(res.data!);
            } else {
                Alert.alert("Error", res.error || "No se pudieron cargar los trabajadores del parte.");
            }
        }

        fetchParteDetails();
        fetchWorkersParte();
    }, [parteId, accessToken]);


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff"/>
                <Text style={styles.loadingText}>Cargando detalles del parte...</Text>
            </View>
        );
    }

    const renderWorker = ({item}: { item: WorkerParte }) => (
        <View style={styles.lineItem}>
            <Text style={styles.lineDesc}>{item.nombreTrabajador}</Text>
        </View>
    )


    const listaTrabajadores = () => {
        if (workers.length > 0) {

            return (
                <View style={styles.section}>
                    {workers.map((worker: WorkerParte) => (<View style={styles.lineItem}>
                        <Text style={styles.lineDesc}>{worker.nombreTrabajador}</Text>
                    </View>))}
                </View>
            )
        } else {
            return (
                <View style={styles.section}>
                    <Text>No hay trabajadores asignados</Text>
                </View>
            )
        }
    }

    if (!parteDetails) {
        return (
            <View style={styles.container}>
                <Text style={styles.noDataText}>No se encontraron detalles para el parte {parteId}.</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Ionicons style={styles.arrowBack} name={"arrow-back"} onPress={navigation.goBack}></Ionicons>

            <Text style={styles.headerTitle}>Detalles del Parte de Obra #{parteDetails.nParte}</Text>

            <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Proyecto: <Text
                    style={styles.infoValue}>{parteDetails.proyecto}</Text></Text>
                <Text style={styles.infoLabel}>Oferta: <Text
                    style={styles.infoValue}>{parteDetails.oferta}</Text></Text>
                <Text style={styles.infoLabel}>Fecha: <Text style={styles.infoValue}>{parteDetails.fecha}</Text></Text>
                <Text style={styles.infoLabel}>Jefe de Equipo: <Text
                    style={styles.infoValue}>{parteDetails.jefe_equipo}</Text></Text>
                <Text style={styles.infoLabel}>Teléfono: <Text
                    style={styles.infoValue}>{parteDetails.telefono}</Text></Text>
                <Text style={styles.infoLabel}>Contacto Obra: <Text
                    style={styles.infoValue}>{parteDetails.contacto_obra}</Text></Text>
                {parteDetails.comentarios && (
                    <Text style={styles.infoLabel}>Comentarios: <Text
                        style={styles.infoValue}>{parteDetails.comentarios}</Text></Text>
                )}
            </View>
            <TouchableOpacity style={styles.assignWorkersButton} onPress={() => {
                navigation.navigate('AsignarTrabajadoresScreen', {user, accessToken, parteId})
            }}>
                <Text style={styles.assignWorkersText}>👷🏻‍♂️ Asignar trabajadores</Text>
            </TouchableOpacity>
            {listaTrabajadores()}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Líneas del Parte ({parteDetails.lineas.length})</Text>
                {parteDetails.lineas.length === 0 ? (
                    <Text style={styles.noLinesText}>No hay líneas asociadas a este parte.</Text>
                ) : (
                    parteDetails.lineas.map((linea: LineaPartePDF, index: number) => (
                        <View key={linea.id || index} style={styles.lineItem}>
                            <Text style={styles.lineDesc}>{linea.DescripArticulo}</Text>
                            <Text style={styles.lineQuantity}>{linea.cantidad} {linea.UnidadMedida}</Text>
                        </View>
                    ))
                )}
            </View>

            <TouchableOpacity style={styles.generatePdfButton} onPress={() => {
                apiService.imprimirPDF(parteId.toString(), accessToken).then(response => {
                    if (response.data.mensaje == 'OK') {
                        Alert.alert("PDF generado", "El PDF se ha generado correctamente.", [])
                    }
                })
            }}>
                <Text style={styles.generatePdfButtonText}>Generar Parte en PDF</Text>
            </TouchableOpacity>
            {/* Puedes mostrar la firma si la tienes y es una imagen base64 */}
            {/* {parteDetails.signature && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Firma</Text>
                    <Image source={{ uri: `data:image/png;base64,${parteDetails.signature}` }} style={styles.signatureImage} />
                </View>
            )} */}
            <View style={{height: 50}}/>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f7',
        padding: 20,
        paddingTop: 90,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f4f7',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    noDataText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 50,
    },
    backButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 8,
        marginTop: 20,
        alignSelf: 'center',
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    arrowBack: {
        fontSize: 30,
        position: 'absolute',
        marginTop: -35
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 20,
        textAlign: 'center',
    },
    infoBox: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderLeftWidth: 5,
        borderLeftColor: '#5BBDB3',
    },
    infoLabel: {
        fontSize: 16,
        color: '#919191',
        marginBottom: 5,
    },
    infoValue: {
        fontWeight: 'bold',
        color: '#000000',
    },
    section: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    lineItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    lineDesc: {
        fontSize: 15,
        color: '#555',
        flex: 3,
    },
    lineQuantity: {
        fontSize: 15,
        color: '#777',
        flex: 1,
        textAlign: 'right',
    },
    noLinesText: {
        fontSize: 15,
        color: '#888',
        textAlign: 'center',
        paddingVertical: 10,
    },
    assignWorkersButton: {
        backgroundColor: '#eaa53e',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    assignWorkersText: {
        fontSize: 18,
        fontWeight: '500'
    },
    generatePdfButton: {
        backgroundColor: '#5BBDB3',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    generatePdfButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signatureImage: {
        width: '100%',
        height: 150,
        resizeMode: 'contain',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 5,
    },
});