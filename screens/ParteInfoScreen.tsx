// ParteInfoScreen.tsx
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {StackScreenProps} from "@react-navigation/stack";
import {MainTabParamList} from "../App";
import {apiService, ParteData} from "../config/apiService";
import React, {useState} from "react";

interface ParteDataDTO {
    // todo aqui metería la imagen que me pasa el nuevo endpoint
    // todo HACER DTO EN PYTHON PARA ESTO
}

type InfoParteProps = StackScreenProps<MainTabParamList, 'InfoParte'>; // Removed `parte: ParteData` from here
export default function InfoParte({route, navigation}: InfoParteProps) { // Removed `parte` from destructuring props
    const {parte_id} = route.params as { parte_id: number }; // Extract parte from route.params
    const {accessToken} = route.params as { accessToken: string }
    const [parte, setParte] = useState<ParteData>()
    const [loading, setLoading] = useState(true)


    React.useEffect(() => {
        apiService.getParte(accessToken, parte_id).then(response => {
            setParte(response.data);
        }).catch(error => {
            console.error("Error fetching projects:", error);
        }).finally(() => {
            setLoading(false);
        });
    }, [parte_id, accessToken])

    if (!parte) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No se han proporcionado datos del parte.</Text>
            </View>
        );
    }

    let imgSource = {uri: parte.signature}
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Detalles del Parte</Text>

            <View style={styles.card}>
                <Text style={styles.label}>ID del Parte:</Text>
                <Text style={styles.value}>{parte?.id}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Estado:</Text>
                <Text style={[styles.value, parte?.status === 'active' ? styles.statusActive : styles.statusInactive]}>
                    {parte?.status}
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Fecha del Parte:</Text>
                <Text style={styles.value}>{parte?.parteDate}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Team Manager:</Text>
                <Text style={styles.value}>{parte?.teamManager.name}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Proyecto:</Text>
                <Text style={styles.value}>{parte?.project?.title || 'N/A'} - {parte?.project?.id}</Text>
                <Text style={styles.subValue}>Cliente: {parte?.project?.contact.title || 'N/A'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actividades:</Text>
                {parte?.actividades && parte?.actividades.length > 0 ? (
                    parte?.actividades.map((activity, index) => (
                        <View key={index} style={styles.activityCard}>
                            <Text style={styles.activityText}>{activity.name}</Text>
                            <Text style={styles.activityText}>Cantidad: {activity.cantidad} {activity.unidad}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.value}>No hay actividades registradas.</Text>
                )}
            </View>

            <TouchableOpacity style={styles.assignWorkersCard}>
                <Text style={styles.workersLabel}>👷🏻‍♂️ Asignar trabajadores</Text>
            </TouchableOpacity>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Firma del cliente:</Text>
                <Image source={imgSource} style={styles.signatureImage}/>
            </View>


            {parte?.comments && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Comentarios:</Text>
                    <Text style={styles.value}>{parte?.comments}</Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginTop: 40,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 25,
        color: '#333',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    assignWorkersCard: {
        backgroundColor: '#3EB1A5',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    workersLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginBottom: 5,
    },
    value: {
        fontSize: 16,
        color: '#333',
    },
    subValue: {
        fontSize: 14,
        color: '#666',
        marginTop: 3,
    },
    statusActive: {
        color: 'green',
        fontWeight: 'bold',
    },
    statusInactive: {
        color: 'red',
        fontWeight: 'bold',
    },
    section: {
        marginTop: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    activityCard: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#007bff',
    },
    activityText: {
        fontSize: 15,
        color: '#444',
    },
    signatureImage: {
        width: '100%',
        height: 200, // Ajusta la altura según sea necesario
        borderWidth: 1,
        borderColor: '#ddd',
        marginTop: 10,
        objectFit: 'cover',
        marginBottom: 5,
    },
    imageDisclaimer: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginTop: 50,
    },
});