import { StackScreenProps } from "@react-navigation/stack";
import { MainTabParamList } from "../../App";
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
    Dimensions,
    LayoutAnimation,
    Platform,
    UIManager
} from "react-native";
import React, { useCallback, useEffect } from "react";
import { apiService } from "../../config/apiService";
import { Ionicons } from "@expo/vector-icons";
import { Oferta, ParteMOEnviar, ParteMOListaDTO } from "../../config/types";

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const ParteItem = ({ item }: { item: ParteMOListaDTO }) => {
    const [expanded, setExpanded] = React.useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <TouchableOpacity style={styles.itemContainer} onPress={toggleExpand} activeOpacity={0.8}>
            <View style={styles.itemHeader}>
                <Ionicons style={styles.iconBadge} name={'briefcase-outline'} />
                <View style={styles.parteMOInfoContainer}>
                    <Text style={styles.itemTitle}>
                        {item.actividades?.length > 0
                            ? item.actividades.map(a => a.nombre).join(", ").substring(0, 30) + (item.actividades.length > 1 ? "..." : "")
                            : "Sin actividades"}
                    </Text>
                    <Text style={styles.itemDetails}>{item.fecha?.replace("T", " - ")}</Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    item.estado === 'pendiente' ? styles.pendingBadge :
                        item.estado === 'validado' ? styles.unpendingBadge :
                            styles.cancelledBadge
                ]}>
                    <Text style={styles.statusText}>{item.estado?.toUpperCase() || 'N/A'}</Text>
                </View>
            </View>

            {expanded && (
                <View style={styles.expandedContent}>
                    {/* SEPARATOR */}
                    <View style={styles.separator} />

                    {/* ACTIVIDADES */}
                    <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Actividades:</Text>
                        {item.actividades && item.actividades.length > 0 ? (
                            item.actividades.map((act, index) => (
                                <Text key={index} style={styles.detailText}>• {act.nombre}</Text>
                            ))
                        ) : (
                            <Text style={styles.detailText}>- No hay actividades registradas</Text>
                        )}
                    </View>

                    {/* MATERIALES */}
                    <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Materiales:</Text>
                        {item.materiales && item.materiales.length > 0 ? (
                            item.materiales.map((mat, index) => (
                                <Text key={index} style={styles.detailText}>
                                    • {mat.cantidad} x {mat.idArticulo} ({mat.lote || 'Sin lote'})
                                </Text>
                            ))
                        ) : (
                            <Text style={styles.detailText}>- No hay materiales</Text>
                        )}
                    </View>

                    {/* VEHICULO */}
                    <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Vehículo:</Text>
                        <Text style={styles.detailText}>
                            {item.vehiculo ? `• ${item.vehiculo}` : "- No asignado"}
                        </Text>
                    </View>

                </View>
            )}
        </TouchableOpacity>
    );
};

type InfoParteMOProps = StackScreenProps<MainTabParamList, 'InfoParteMO'>; // Removed `parte: ParteData` from here

export default function InfoParteMO({ route, navigation }: InfoParteMOProps) {
    const { idOferta } = route.params as { idOferta: number }; // Extract oferta from route.params
    const { user } = route.params as { user: any }
    const { oferta } = route.params as { oferta: Oferta }

    const { accessToken } = route.params as { accessToken: string }
    const [loading, setLoading] = React.useState(true)
    const [refreshing, setRefreshing] = React.useState(false)
    const [partes, setPartes] = React.useState<any>()

    console.log(idOferta)
    const fetchPartesMO = useCallback(() => {
        setRefreshing(true); // Inicia el estado de refrescando
        console.log("Fetching partes of oferta", idOferta);
        apiService.getPartesMO(idOferta, accessToken, user.id).then(response => {
            console.log(response.data)
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

    const renderItem = ({ item }: { item: ParteMOListaDTO }) => {
        return <ParteItem item={item} />;
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
                            accessToken: accessToken,
                            nPartes: partes ? partes.length + 1 : 1
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




// Ensure itemContainer supports column layout for expansion
// but header is row.
// We need to modify itemContainer to wrap content properly

// UPDATE STYLES
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
        shadowOffset: { width: 0, height: 2 },
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
        backgroundColor: '#5bbd6f',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    // UPDATED ITEM STYLES
    itemContainer: {
        backgroundColor: "white",
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        // Changed from just row to column to handle expansion
        flexDirection: 'column',
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    expandedContent: {
        marginTop: 12,
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 12,
    },
    detailSection: {
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    detailText: {
        fontSize: 14,
        color: '#555',
        marginLeft: 8,
        marginBottom: 2,
    },
    iconBadge: {
        padding: 12,
        fontSize: 20,
        borderRadius: 40,
        backgroundColor: '#eaeaea',
        marginRight: 10,
    },
    parteMOInfoContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: 2,
    },
    statusBadge: {
        height: 24, // increased slightly
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8, // add margin to separate from text
    },
    statusText: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#333", // Ensure text is visible depending on badge color
    },
    itemDetails: {
        fontSize: 14,
        color: "#64748b",
    },
});
