// InfoOfertasScreen.tsx
import {Alert, Button, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {StackScreenProps} from "@react-navigation/stack";
import {MainTabParamList} from "../App";
import {apiService, LineaOferta, Oferta} from "../config/apiService";
import React, {useState} from "react";
import {Ionicons} from "@expo/vector-icons";


type InfoOfertaProps = StackScreenProps<MainTabParamList, 'InfoOferta'>; // Removed `parte: ParteData` from here
export default function InfoOferta({route, navigation}: InfoOfertaProps) { // Removed `oferta` from destructuring props
    const {idOferta} = route.params as { idOferta: number }; // Extract oferta from route.params
    const {user} = route.params as { user: any }
    const {accessToken} = route.params as { accessToken: string }
    const [lineas, setLineas] = useState<LineaOferta[]>()
    const [loading, setLoading] = useState(true)
    const {oferta} = route.params as { oferta: Oferta }
    React.useEffect(() => {
        apiService.getLineasOferta(idOferta, accessToken).then(response => {
            setLineas(response.data);
        }).catch(error => {
            console.error("Error fetching projects:", error);
        }).finally(() => {
            setLoading(false);
        });
    }, [idOferta, accessToken])

    if (!lineas) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No se han proporcionado datos del parte.</Text>
            </View>
        );
    }
    const groupLineasByIdParte = (lineas: LineaOferta[]) => {
        return lineas.reduce((acc: { [key: number]: LineaOferta[] }, linea) => {
            const idParte = linea.ppcl_IdParte;
            if (idParte) {
                if (!acc[idParte]) {
                    acc[idParte] = [];
                }
                acc[idParte].push(linea);
            } else {
                if (!acc[0]) acc[0] = []
                acc[0].push(linea);
            }
            return acc;
        }, {});
    };
    const groupedLineas = groupLineasByIdParte(lineas);
    const idPartes = Object.keys(groupedLineas).map(Number).sort((a, b) => a - b); // Get and sort unique idPartes
    // let imgSource = {uri: oferta.signature}
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Detalles de la oferta</Text>
            <Ionicons style={styles.arrowBack} name={"arrow-back"} onPress={navigation.goBack}></Ionicons>
            <View style={styles.card}>
                <Text style={styles.label}>ID proyecto:
                    <Text style={styles.value}> {oferta.idProyecto}</Text>
                </Text>

                <Text style={styles.label}>Cliente:
                    <Text style={styles.value}> {oferta.cliente}
                        {/* TODO METER CONTACTO DEL CLIENTE AQUI */}
                    </Text>
                </Text>

                <Text style={styles.label}>ID Oferta: {oferta.idOferta}</Text>
                <Text style={styles.label}>Descripción proyecto:
                    <Text style={styles.value}> {oferta.descripcion}</Text>
                </Text>
            </View>
            {
                <View style={styles.card}>
                    <Text style={styles.label}>Observaciones: </Text>
                    <Text style={styles.value}>{oferta.observaciones}</Text>
                </View>
            }

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lineas por parte:</Text>
                <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CrearParte',
                    {
                        user: user,
                        accessToken: accessToken,
                        oferta: oferta,
                        lineas: lineas,
                        proyecto: oferta.descripcion,
                    })}><Text>➕ Crear Parte</Text></TouchableOpacity>
                {/* TODO hacer entero (listar las lineas agrupadas por parte) */}
                {lineas && lineas.length > 0 ? (
                    // Map over the sorted idPartes
                    idPartes.map((idParte) => (
                        <View key={idParte}>
                            {/* Title for the group */}
                            <Text
                                style={styles.groupTitle}>{idParte ? "Grupo parte: " + idParte + "" : "Líneas sin parte"}</Text>
                            {/* Map over the lineas within this idParte group */}
                            {groupedLineas[idParte].map((linea: LineaOferta) => (
                                <TouchableOpacity
                                    key={linea.ocl_IdArticulo} // Use a unique key for each linea
                                    onPress={() => navigation.navigate("InfoLinea", {user, accessToken, linea})}>
                                    <View
                                        style={linea.ppcl_Certificado === 0 ? styles.activityCardNoCert : styles.activityCard}>
                                        <Text style={styles.activityText}>{linea.ocl_Descrip}</Text>
                                        <Text
                                            style={styles.activityText}>Cantidad: {linea.ocl_UnidadesPres} {linea.ppcl_UnidadMedida}</Text>
                                        <Text
                                            style={styles.activityText}>Certificado: {linea.ppcl_Certificado > 0 ? "Sí" : "No"}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))
                ) : (
                    <Text style={styles.value}>No hay lineas registradas.</Text>
                )}
            </View>

            {/*<TouchableOpacity style={styles.assignWorkersCard}>*/
            }
            {/*    <Text style={styles.workersLabel}>👷🏻‍♂️ Asignar trabajadores</Text>*/
            }
            {/*</TouchableOpacity>*/
            }

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
    groupTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: '#e0e0e0', // Light background for group titles
        paddingVertical: 5,
        borderRadius: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 25,
        color: '#333',
        textAlign: 'center',
    },
    arrowBack: {
        fontSize: 30,
        position: 'absolute',
        paddingTop: 3
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
        fontWeight: 'normal',
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
        marginBottom: 80,
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
        borderLeftColor: '#5BBDB3',
    },
    activityCardNoCert: {
        backgroundColor: '#d8d8d8',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#fa3636',
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
