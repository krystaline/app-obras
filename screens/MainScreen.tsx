// MenuScreen.tsx
import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {MainTabParamList, RootStackParamList} from '../App';
import {Ionicons} from "@expo/vector-icons";
import {apiService, ParteData} from "../config/apiService"; // Importa tu RootStackParamList

type MainScreenProps = StackScreenProps<MainTabParamList, 'ListarPartes'> & {
    navigation: StackScreenProps<RootStackParamList>['navigation']; // Para acceder al RootStack
};
export default function MainScreen({route, navigation}: MainScreenProps) {
    const {user, accessToken} = route.params;

    const [data, setData] = useState<ParteData[]>()
    const [refreshing, setRefreshing] = useState(false)

    const onRefresh = React.useCallback(() => {
        setRefreshing(true)
        // Simulate API call
        apiService.getPartes(accessToken).then(response => {
            setData(response.data)
            console.log(response.data)
        })


        setTimeout(() => {
            setRefreshing(false)
        }, 1000)
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "#10b981"
            case "pending":
                return "#f59e0b"
            case "completed":
                return "#6366f1"
            default:
                return "#64748b"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return "play-circle"
            case "pending":
                return "time"
            case "completed":
                return "checkmark-circle"
            default:
                return "help-circle"
        }
    }


    const renderItem = ({item}: { item: ParteData }) => (
        <TouchableOpacity style={styles.itemContainer}
                          onPress={() => navigation.navigate('InfoParte', {parte_id: item.id})}
        >
            <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{item.project.id} - {item.project.title} </Text>
                <View style={[styles.statusBadge, {backgroundColor: getStatusColor(item.status)}]}>
                    <Ionicons name={getStatusIcon(item.status) as any} size={12} color="white"
                              style={styles.statusIcon}/>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>

            </View>

            <Text style={styles.itemDate}>{item.teamManager.name}</Text>
            <Text style={styles.itemDate}>Fecha: {(item.parteDate)}</Text>
            <Text style={styles.itemDescription}>{item.actividades[0].name}</Text>
        </TouchableOpacity>
    )

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {/* Botón para abrir el Menú */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('Menu', {user, accessToken})}
                    style={styles.menuButton}
                >
                    <Ionicons name="menu" size={30} color="#1e293b"/>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Lista de Partes</Text>
                    <Text style={styles.headerSubtitle}>Gestiona los partes de obra de {user.displayName}</Text>
                </View>
            </View>

            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    header: {
        padding: 20,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    menuButton: {
        position: "absolute",
        marginTop: 32,
        right: 22,
        top: 40,
        transform: 'scale(1.4)',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1e293b",
        marginBottom: 4,
        marginTop: 70,
    },
    headerSubtitle: {
        fontSize: 16,
        color: "#64748b",
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
        shadowOffset: {
            width: 0,
            height: 2,
        },
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
    statusIcon: {
        marginRight: 4,
    },
    statusText: {
        color: "white",
        fontSize: 12,
        fontWeight: "500",
        textTransform: "capitalize",
    },
    itemDescription: {
        fontSize: 14,
        color: "#3b4955",
        marginTop: 8,
        marginBottom: 8,
        lineHeight: 20,
    },
    itemDate: {
        fontSize: 12,
        color: "#94a3b8",
    },
})
