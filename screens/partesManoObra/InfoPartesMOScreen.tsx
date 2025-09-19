import {StackScreenProps} from "@react-navigation/stack";
import {MainTabParamList} from "../../App";
import {
    Alert,
    Button,
    FlatList,
    Image, Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions
} from "react-native";
import React, {useCallback, useEffect} from "react";
import {apiService} from "../../config/apiService";
import {Ionicons} from "@expo/vector-icons";
import {Oferta} from "../../config/types";
import {ParteMOEnviar} from "./NewParteMOScreen";

type InfoParteMOProps = StackScreenProps<MainTabParamList, 'InfoParteMO'>; // Removed `parte: ParteData` from here

export default function InfoParteMO({route, navigation}: InfoParteMOProps) {
    const {idOferta} = route.params as { idOferta: number }; // Extract oferta from route.params
    const {user} = route.params as { user: any }
    const {oferta} = route.params as { oferta: Oferta }

    const {accessToken} = route.params as { accessToken: string }
    const [loading, setLoading] = React.useState(true)
    const [refreshing, setRefreshing] = React.useState(false)
    const [partes, setPartes] = React.useState<any>()

    console.log(idOferta)
    const fetchPartesMO = useCallback(() => {
        setRefreshing(true); // Inicia el estado de refrescando
        console.log("Fetching partes of oferta", idOferta);
        apiService.getPartesMO(idOferta, accessToken).then(response => {
            setPartes(response.data);
        }).catch(error => {
            console.error("Error fetching partes:", error);
            Alert.alert("Error", "No se pudieron cargar los partes asociados"); // Opcional: mostrar un error al usuario
        }).finally(() => {
            setLoading(false);
            setRefreshing(false); // Finaliza el estado de refrescando
        });
    }, [idOferta, accessToken]); // Dependencias para useCallbac


    const onRefresh = useCallback(() => {
        fetchPartesMO()
    }, [fetchPartesMO]);

    useEffect(() => {
        fetchPartesMO()
    }, []);

    const renderItem = ({item}: { item: ParteMOEnviar }) => {
        // UI para una Oferta
        return (
            <TouchableOpacity style={styles.itemContainer} onPress={() => {
            }}>
                <Ionicons style={styles.iconBadge} name={'briefcase-outline'}></Ionicons>
                <View style={styles.parteMOInfoContainer}>
                    <Text style={styles.itemTitle}>{item.idProyecto}</Text>
                    <Text style={styles.itemDetails}>{item.creation_date}</Text>
                </View>
                <Text
                    style={[styles.statusBadge, item.estado === 'pendiente' ? styles.pendingBadge : item.estado === 'validado' ? styles.unpendingBadge : styles.cancelledBadge]}><Text
                    style={[styles.statusText]}>{item.estado?.toUpperCase()}</Text></Text>
            </TouchableOpacity>
        );
    };
    return (
        <ScrollView style={styles.container}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#5bbd6f']} // Color del spinner en Android
                            tintColor={'#5bbd6f'} // Color del spinner en iOS
                        />
                    }
        >
            <Text style={styles.title}>Información Proyecto</Text>
            <Ionicons style={styles.arrowBack} name={"arrow-back"}
                      onPress={navigation.goBack}></Ionicons>
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

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mis partes: </Text>
                <TouchableOpacity style={[styles.createCard]}
                                  onPress={() => navigation.navigate('CrearParteMO',
                                      {
                                          user: user,
                                          proyecto: oferta.idProyecto,
                                          oferta: oferta,
                                          accessToken: accessToken
                                      })}><Text>
                    Crear Parte ➕</Text></TouchableOpacity>
                <FlatList
                    data={partes}
                    keyExtractor={(item) => String('idParte' in item ? item.idParte : "")}
                    renderItem={renderItem}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyListContainer}>
                            <Text style={styles.emptyListText}>No tienes partes de mano de obra para este
                                proyecto.</Text>
                            <TouchableOpacity onPress={fetchPartesMO} style={styles.refreshButton}>
                                <Text style={styles.refreshButtonText}>Recargar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />

            </View>
        </ScrollView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginTop: 40,
        backgroundColor: '#f8f8f8',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)', // Un fondo semi-transparente
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1, // Para asegurar que esté por encima de la imagen
    },
    grid: {
        paddingTop: 10,
        alignItems: 'center',
    },
    imageContainer: {
        width: 100,
        height: 100,
        padding: 2, // Espacio entre las imágenes
    },
    image: {
        width: '100%',
        height: '100%',
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
    createCard: {
        position: 'absolute',
        right: 0,
        borderRadius: 12,
        borderColor: '#eaeaea',
        paddingVertical: 5,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        borderWidth: 2,
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
    addImageButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        padding: 15,
    },
    addImageText: {
        color: '#555',

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
        backgroundColor: '#fad000',
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
        marginBottom: 25,
        color: '#333',
    },
    seeAllImagesButton: {
        backgroundColor: '#e4e4e4',
        width: '100%',
        margin: 'auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 12,
        paddingBottom: 8,
        marginTop: 8,
        borderRadius: 10,
    },
    activityCard: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#5bbd6f',
    },
    activityCardNoCert: {
        backgroundColor: '#dddddd',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#fad44f',
    },
    pendingBadge: {
        backgroundColor: '#fad44f',
        color: 'black',
    },
    unpendingBadge: {
        backgroundColor: '#a6ff5e',
    },
    cancelledBadge: {
        backgroundColor: '#ff5151',
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
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyListText: {
        fontSize: 16,
        color: '#888',
        marginBottom: 10,
    },
    refreshButton: {
        backgroundColor: '#5BBDB3',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    itemContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        position: 'relative',
        backgroundColor: "white",
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconBadge: {
        padding: 12,
        fontSize: 20,
        borderRadius: 40,
        backgroundColor: '#eaeaea'
    },
    parteMOInfoContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '90%',
        marginLeft: 15,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1e293b",
        flex: 1,
    },
    statusBadge: {
        height: 20,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "bold",
    },
    itemDetails: {
        fontSize: 14,
        color: "#64748b",
        marginBottom: 4,
    },
});
