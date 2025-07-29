// InfoOfertasScreen.tsx
import {Alert, Button, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {StackScreenProps} from "@react-navigation/stack";
import {MainTabParamList} from "../App";
import {apiService} from "../config/apiService";
import React, {useCallback, useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import {LineaOferta, Oferta} from "../config/types";


type InfoOfertaProps = StackScreenProps<MainTabParamList, 'InfoOferta'>; // Removed `parte: ParteData` from here
export default function InfoOferta({route, navigation}: InfoOfertaProps) { // Removed `oferta` from destructuring props
    const {idOferta} = route.params as { idOferta: number }; // Extract oferta from route.params
    const {user} = route.params as { user: any }
    const {accessToken} = route.params as { accessToken: string }
    const [lineas, setLineas] = useState<LineaOferta[]>()
    const [loading, setLoading] = useState(true)
    const {oferta} = route.params as { oferta: Oferta }
    const [refreshing, setRefreshing] = useState(false)


    const fetchLineasOferta = useCallback(() => {
        setRefreshing(true); // Inicia el estado de refrescando
        apiService.getLineasOferta(idOferta, accessToken).then(response => {
            setLineas(response.data);
        }).catch(error => {
            console.error("Error fetching projects:", error);
            Alert.alert("Error", "No se pudieron cargar las líneas de la oferta."); // Opcional: mostrar un error al usuario
        }).finally(() => {
            setLoading(false);
            setRefreshing(false); // Finaliza el estado de refrescando
        });
    }, [idOferta, accessToken]); // Dependencias para useCallback

    React.useEffect(() => {
        fetchLineasOferta(); // Llama a la función al montar el componente
    }, [fetchLineasOferta]); // Dependencia para useEffect

    const onRefresh = useCallback(() => {
        fetchLineasOferta(); // Llama a la misma función para refrescar
    }, [fetchLineasOferta]);

    if (!lineas && !loading) { // Cambia la condición para mostrar el error solo si no hay líneas y no está cargando
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No se han proporcionado datos del parte.</Text>
            </View>
        );
    }
    // Inside your InfoOferta component:

    const groupLineasByParteAndQuantityStatus = (lineas: LineaOferta[]) => {
        const groupedByParte: { [key: number]: { completed: LineaOferta[], pending: LineaOferta[] } } = {};

        lineas.forEach(linea => {
            const idParte = linea.ppcl_IdParte || 0; // Use 0 for lines without a part

            if (!groupedByParte[idParte]) {
                groupedByParte[idParte] = {completed: [], pending: []};
            }
            // @ts-ignore
            if (linea.ppcl_cantidad <= linea.ocl_UnidadesPres) {
                console.log("linea completada", linea)
                groupedByParte[idParte].completed.push(linea);
            } else {
                groupedByParte[idParte].pending.push(linea);
            }
        });

        return groupedByParte;
    };

    const groupedAndStatusLineas = lineas ? groupLineasByParteAndQuantityStatus(lineas) : {};
    const idPartes = Object.keys(groupedAndStatusLineas).map(Number).sort((a, b) => a - b);

    return (
        <ScrollView style={styles.container}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#3EB1A5']} // Color del spinner en Android
                            tintColor={'#3EB1A5'} // Color del spinner en iOS
                        />
                    }
        >
            <Text style={styles.title}>Detalles de la oferta</Text>
            <Ionicons style={styles.arrowBack} name={"arrow-back"} onPress={navigation.goBack}></Ionicons>
            <View style={styles.card}>
                <Text style={styles.label}>ID proyecto:
                    <Text style={styles.value}> {oferta.idProyecto}</Text>
                </Text>

                <Text style={styles.label}>Cliente:
                    <Text style={styles.value}> {oferta.cliente}
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
                        lineas: lineas!,
                        proyecto: oferta.descripcion ? oferta.descripcion : "",
                    })}><Text>➕ Crear Parte</Text></TouchableOpacity>
                {lineas && lineas.length > 0 ? (
                    idPartes.map((idParte) => (
                        <TouchableOpacity key={idParte} onPress={() => {
                            navigation.navigate('ParteDetail', {
                                user: user, accessToken: accessToken, parteId: idParte
                            })
                        }}>
                            <Text
                                style={styles.groupTitle}>{idParte ? "Grupo parte: " + idParte + "" : "Líneas sin parte"}</Text>

                            {groupedAndStatusLineas[idParte].completed.length > 0 && (
                                <View>
                                    <Text style={styles.subGroupTitle}>Cantidad Realizada || Cantidad Ofertada:</Text>
                                    {groupedAndStatusLineas[idParte].completed.map((linea: LineaOferta) => (
                                        <TouchableOpacity
                                            key={linea.ocl_idlinea}
                                            onPress={() => navigation.navigate("InfoLinea", {
                                                user,
                                                accessToken,
                                                linea,
                                                idParte
                                            })}>
                                            <View
                                                style={linea.ppcl_Certificado === 0 ? styles.activityCardNoCert : styles.activityCard}>
                                                <Text style={styles.activityText}>{linea.ocl_Descrip}</Text>
                                                <Text style={styles.activityText}>Cantidad
                                                    (realizado/ofertado): {linea.ppcl_cantidad} / {linea.ocl_UnidadesPres}</Text>
                                                <Text style={styles.activityText}>ID
                                                    Actividad: {linea.ocl_IdArticulo}</Text>
                                                <Text
                                                    style={styles.activityText}>Certificado: {linea.ppcl_Certificado > 0 ? "Sí" : "No"}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {groupedAndStatusLineas[idParte].pending.length > 0 && (
                                <View>
                                    <Text style={styles.subGroupTitle}>Cantidad Realizada | Cantidad Ofertada:</Text>
                                    {groupedAndStatusLineas[idParte].pending.map((linea: LineaOferta) => (
                                        <TouchableOpacity
                                            key={linea.ocl_idlinea}
                                            onPress={() => navigation.navigate("InfoLinea", {
                                                user,
                                                accessToken,
                                                linea,
                                                idParte
                                            })}>
                                            <View
                                                style={linea.ppcl_Certificado === 0 ? styles.activityCardNoCert : styles.activityCard}>
                                                <Text style={styles.activityText}>{linea.ocl_Descrip}</Text>
                                                <Text style={styles.activityText}>Cantidad
                                                    (realizado/ofertado): {linea.ppcl_cantidad} / {linea.ocl_UnidadesPres}{linea.ocl_tipoUnidad}</Text>
                                                <Text style={styles.activityText}>ID
                                                    Actividad: {linea.ocl_IdArticulo}</Text>
                                                <Text
                                                    style={styles.activityText}>Certificado: {linea.ppcl_Certificado > 0 ? "Sí" : "No"}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.value}>No hay lineas registradas.</Text>
                )}
            </View>
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
        backgroundColor: '#ececec', // Light background for group titles
        paddingVertical: 10,
        borderRadius: 5,
    },
    subGroupTitle: {
        backgroundColor: '#ffffff',
        paddingVertical: 4,
        paddingHorizontal: 10,
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
        backgroundColor: '#dddddd',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#fad44f',
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
