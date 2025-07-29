// MainScreen.tsx (No hay cambios funcionales significativos aquí por la limitación del backend)
import React, {useState} from 'react';
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
import {Oferta} from "../config/types"; // Importa tu RootStackParamList

type MainScreenProps = StackScreenProps<MainTabParamList, 'ListarPartes'> & {
    navigation: StackScreenProps<RootStackParamList>['navigation']; // Para acceder al RootStack
};

export default function MainScreen({route, navigation}: MainScreenProps) {
    const {user, accessToken} = route.params;

    const [ofertas, setOfertas] = useState<Oferta[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [filteredOfertas, setFilteredOfertas] = useState<Oferta[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchOfertas = React.useCallback(async () => {
        setRefreshing(true);
        setLoading(true);
        const response = await apiService.getOfertas(accessToken);
        if (response.success && response.data) {
            setOfertas(response.data);
            setFilteredOfertas(response.data);
        } else {
            Alert.alert("Error", response.error || "No se pudieron cargar las ofertas.");
        }
        setRefreshing(false);
        setLoading(false);
    }, [accessToken]);

    React.useEffect(() => {
        fetchOfertas();
    }, [fetchOfertas]);

    React.useEffect(() => {
        if (searchQuery) {
            const filtered = ofertas.filter(oferta =>
                oferta.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(oferta.idOferta).includes(searchQuery) ||
                oferta.idProyecto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                oferta.cliente?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredOfertas(filtered);
        } else {
            setFilteredOfertas(ofertas);
        }
    }, [searchQuery, ofertas]);

    // Esta función maneja la navegación a la pantalla de detalle de oferta, no de parte
    const handleSelectOferta = (oferta: Oferta) => {
        // Podrías navegar a una pantalla de detalles de oferta si la tienes
        // o usar esta pantalla para seleccionar un parte existente si tuvieras la lista de partes.
        // Por ahora, solo es un marcador.
        navigation.navigate('InfoOferta', {
            idOferta: oferta.idOferta,
            accessToken: accessToken,
            user: user,
            oferta: oferta
        })
        //
        //Si tuvieras una lista de Partes aquí, podrías navegar a ParteDetailScreen.
        //Por ahora, puedes ir a 'Todas las Líneas' para crear un parte nuevo.`);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff"/>
                <Text style={styles.loadingText}>Cargando ofertas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Hola, {user.displayName}</Text>
                <Text style={styles.headerSubtitle}>Tus ofertas y partes recientes</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Menu', {user, accessToken})}
                                  style={styles.menuButton}>
                    <Ionicons name="menu" size={30} color="#fff"/>
                </TouchableOpacity>
            </View>
            <TextInput
                style={styles.searchBar}
                placeholder="Buscar ofertas..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <FlatList
                data={filteredOfertas}
                keyExtractor={(item) => String(item.idOferta)}
                renderItem={({item}) => (
                    <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelectOferta(item)}>
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
                )}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchOfertas} colors={["#00ffa6"]}/>
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyListContainer}>
                        <Text style={styles.emptyListText}>No hay ofertas disponibles.</Text>
                        <TouchableOpacity onPress={fetchOfertas} style={styles.refreshButton}>
                            <Text style={styles.refreshButtonText}>Recargar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}

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
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#ffffff",
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
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