// MainScreen.tsx
import React, {useState, useEffect, useCallback} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    TextInput,
    Alert,
    ActivityIndicator
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {MainTabParamList, RootStackParamList} from '../App';
import {Ionicons} from "@expo/vector-icons";
import {apiService} from "../config/apiService";
import {Oferta} from "../config/types";

type MainScreenProps = StackScreenProps<MainTabParamList, 'ListarPartesMO'> & {
    navigation: StackScreenProps<RootStackParamList>['navigation'];
};


export default function MainScreen({route, navigation}: MainScreenProps) {
    const {user, accessToken} = route.params;

    // Estado para controlar qué lista se muestra
    const [listType, setListType] = useState<'ofertas' | 'partes' | 'incidencias'>('ofertas');

    // El resto de tus estados, adaptados a la lógica dual
    const [data, setData] = useState<Oferta[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [filteredData, setFilteredData] = useState<Oferta[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Función para obtener la data (Ofertas o Partes)
    const fetchData = useCallback(async () => {
        setRefreshing(true);
        setLoading(true);
        let response;
        response = await apiService.getOfertas(accessToken);

        if (response.success && response.data) {
            setData(response.data);
            setFilteredData(response.data);
        } else {
            Alert.alert("Error", response.error || "No se pudieron cargar los datos.");
        }
        setRefreshing(false);
        setLoading(false);
    }, [accessToken, listType]);

    // Lógica para reaccionar a cambios en el tipo de lista o en el foco de la pantalla
    useEffect(() => {
        fetchData();
        // Listener para cuando se regrese a esta pantalla (por ejemplo, desde el menú)
        const unsubscribe = navigation.addListener('focus', () => {
            if (route.params?.listType && route.params.listType !== listType) {
                setListType(route.params.listType as 'ofertas' | 'partes');
                // Limpia el parámetro para evitar cambios inesperados en futuros focos
                navigation.setParams({listType: undefined});
            }
        });

        return unsubscribe;
    }, [navigation, route.params?.listType, listType, fetchData]);

    useEffect(() => {
        if (searchQuery) {
            const filtered = data.filter(item => {
                return item.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    String(item.idOferta).includes(searchQuery) ||
                    item.idProyecto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.cliente?.toLowerCase().includes(searchQuery.toLowerCase());
            });
            setFilteredData(filtered);
        } else {
            setFilteredData(data);
        }
    }, [searchQuery, data]);

    const handleSelectItem = (item: Oferta) => {
        if (listType === 'ofertas') {
            navigation.navigate('InfoOferta', {
                idOferta: (item as Oferta).idOferta,
                accessToken,
                user,
                oferta: (item as Oferta)
            });
        } else {
            navigation.navigate('InfoParteMO', {
                idOferta: (item as Oferta).idOferta,
                accessToken: accessToken,
                user: user,
                oferta: (item as Oferta)
            });
        }
    };

    // Función para renderizar el ítem de la lista según el tipo
    const renderItem = ({item}: { item: Oferta }) => {
        // UI para una Oferta
        return (
            <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelectItem(item)}>
                <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{item.descripcion}</Text>
                    <View
                        style={[styles.statusBadge, item.status === 'activa' ? styles.statusActive : styles.statusInactive]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>
                <Text style={styles.itemDetails}>ID Oferta: {item.idOferta} | Proyecto: {item.idProyecto}</Text>
                <Text style={styles.itemDetails}>Cliente: {item.cliente || 'N/A'}</Text>
                <Text style={styles.itemDetails}>Fecha: {item.fecha?.substring(0, 10)}</Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff"/>
                <Text style={styles.loadingText}>Cargando {listType === 'ofertas' ? 'ofertas' : 'partes'}...</Text>
            </View>
        );
    }

    function renderHeader(headerType: string) {
        if (headerType == "ofertas")
            return (
                <View style={styles.header}>
                    <Text
                        style={styles.headerTitle}>
                        Ofertas de diseño
                    </Text>
                    <Text style={styles.headerSubtitle}>Selecciona un proyecto</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Menu', {user, accessToken})}
                                      style={styles.menuButton}>
                        <Ionicons name="menu" size={30} color="#fff"/>
                    </TouchableOpacity>
                </View>
            )
        else if (headerType == "partes") {
            return (
                <View style={[styles.header, styles.headerPartesMO]}>
                    <Text
                        style={styles.headerTitle}>
                        Partes mano de obra
                    </Text>
                    <Text style={styles.headerSubtitle}>Selecciona un proyecto</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Menu', {user, accessToken})}
                                      style={styles.menuButton}>
                        <Ionicons name="menu" size={30} color="#fff"/>
                    </TouchableOpacity>
                </View>
            )

        } else {
            return (
                <View style={[styles.header, styles.headerIncidencias]}>
                    <Text
                        style={styles.headerIncidenciasTitle}>
                        Incidencias
                    </Text>
                    <Text style={styles.headerIncidenciasSubtitle}>Selecciona una incidencia</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Menu', {user, accessToken})}
                                      style={styles.menuButton}>
                        <Ionicons name="menu" size={30} color="#fff"/>
                    </TouchableOpacity>
                </View>
            )

        }

    }

    return (
        <View style={styles.container}>
            {renderHeader(listType)}
            <TextInput
                style={styles.searchBar}
                placeholder={`Buscar ${listType}...`}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <FlatList
                data={filteredData}
                keyExtractor={(item) => String('idOferta' in item ? item.idOferta : "")}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchData} colors={["#00ffa6"]}/>
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyListContainer}>
                        <Text style={styles.emptyListText}>No hay {listType} disponibles.</Text>
                        <TouchableOpacity onPress={fetchData} style={styles.refreshButton}>
                            <Text style={styles.refreshButtonText}>Recargar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}
// El resto de los estilos se mantienen igual
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f7',
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
    header: {
        backgroundColor: '#5BBDB3',
        paddingHorizontal: 16,
        paddingBottom: 75,
        paddingTop: 80,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        alignItems: 'center',
        position: 'relative',
        color: "#ffffff",

    },
    headerPartesMO: {
        backgroundColor: '#5bbd6f',
        color: "#ffffff",

    },
    headerIncidencias: {
        backgroundColor: '#fada3a',
        color: 'red'
    },
    headerIncidenciasSubtitle: {
        fontSize: 18,
        color: "#737373",
    },
    headerIncidenciasTitle: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 4,
        color: '#000'
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 4,
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 18,
        color: "#e0e0e0",
    },
    menuButton: {
        position: 'absolute',
        top: 45,
        right: 20,
        padding: 5,
    },
    searchBar: {
        height: 45,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 15,
        marginHorizontal: 10,
        marginTop: -55, // Superpone al header
        marginBottom: 15,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    listContainer: {
        padding: 16,
    },
    itemContainer: {
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
    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1e293b",
        flex: 1,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#fff",
    },
    statusActive: {
        backgroundColor: '#28a745',
    },
    statusInactive: {
        backgroundColor: '#dc3545',
    },
    itemDetails: {
        fontSize: 14,
        color: "#64748b",
        marginBottom: 4,
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
});