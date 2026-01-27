// PartesListScreen.tsx

import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MainTabParamList, RootStackParamList } from '../../App';
import { Ionicons } from "@expo/vector-icons";
import { apiService } from "../../config/apiService";
// import { Parte } from "../../config/types";
type Parte = {
    idParte: string;
    idProyecto: string;
    descripcion: string;
    fecha: string;
    status: string;
}

type PartesListScreenProps = StackScreenProps<MainTabParamList, 'ListarPartesMO'> & {
    navigation: StackScreenProps<RootStackParamList>['navigation'];
};

export default function PartesListScreen({ route, navigation }: PartesListScreenProps) {
    const { user, accessToken } = route.params;

    const [partes, setPartes] = useState<Parte[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [filteredPartes, setFilteredPartes] = useState<Parte[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchPartes = useCallback(async () => {
        setRefreshing(true);
        setLoading(true);
        const response = await apiService.getPartes(accessToken, user.id); // Suponiendo que tienes esta función en tu apiService
        if (response.success && response.data) {
            setPartes(response.data);
            setFilteredPartes(response.data);
        } else {
            Alert.alert("Error", response.error || "No se pudieron cargar los partes de mano de obra.");
        }
        setRefreshing(false);
        setLoading(false);
    }, [accessToken]);

    useEffect(() => {
        fetchPartes();
    }, [fetchPartes]);

    useEffect(() => {
        if (searchQuery) {
            const filtered = partes.filter(parte =>
                parte.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(parte.idParte).includes(searchQuery) ||
                // Agrega otros campos relevantes para la búsqueda de partes
                parte.idProyecto?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredPartes(filtered);
        } else {
            setFilteredPartes(partes);
        }
    }, [searchQuery, partes]);

    const handleSelectParte = (parte: Parte) => {
        // navigation.navigate('ParteDetail', {
        //     parteId: parte.idParte, // Asume que la propiedad es idParte
        //     accessToken,
        //     user
        // });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Cargando partes de mano de obra...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Partes de Mano de Obra</Text>
                <Text style={styles.headerSubtitle}>Tus partes recientes</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Menu', { user, accessToken })}
                    style={styles.menuButton}>
                    <Ionicons name="menu" size={30} color="#fff" />
                </TouchableOpacity>
            </View>
            <TextInput
                style={styles.searchBar}
                placeholder="Buscar partes..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <FlatList
                data={filteredPartes}
                keyExtractor={(item) => String(item.idParte)}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelectParte(item)}>
                        <Text style={styles.itemTitle}>Parte: {item.idParte}</Text>
                        <Text style={styles.itemDetails}>Proyecto: {item.idProyecto || 'N/A'}</Text>
                        <Text style={styles.itemDetails}>Descripción: {item.descripcion || 'N/A'}</Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchPartes} colors={["#00ffa6"]} />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyListContainer}>
                        <Text style={styles.emptyListText}>No hay partes de mano de obra disponibles.</Text>
                        <TouchableOpacity onPress={fetchPartes} style={styles.refreshButton}>
                            <Text style={styles.refreshButtonText}>Recargar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}

// ... (El resto de los estilos, puedes copiarlos o ajustarlos)
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
        backgroundColor: '#7fbd5b',
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
        marginTop: -55,
        marginBottom: 15,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
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
        shadowOffset: { width: 0, height: 2 },
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
        backgroundColor: '#7fbd5b',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});